# Industrial-Grade Validation Middleware
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging
import time
from typing import Dict, Any
import json
from app.validation.validation_service import validation_service, ValidationLevel

import jwt
logger = logging.getLogger(__name__)

class ValidationMiddleware:
    def __init__(self, app):
        self.app = app
        self.request_cache = {}
        self.security_violations = {}
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            
            # Apply validation based on endpoint
            validation_result = await self.validate_request(request)
            
            if validation_result and not validation_result["is_valid"]:
                response = JSONResponse(
                    status_code=validation_result["status_code"],
                    content=validation_result
                )
                await response(scope, receive, send)
                return
        
        await self.app(scope, receive, send)
    
    async def validate_request(self, request: Request) -> Dict[str, Any]:
        """Validate incoming requests based on endpoint patterns"""
        path = request.url.path
        method = request.method
        
        # Skip validation for health checks and docs
        if path in ["/health", "/docs", "/openapi.json"]:
            return None
        
        # Get user info from headers if available
        user_id = None
        auth_header = request.headers.get("authorization")
        if auth_header:
            try:
                # Extract user ID from JWT token (simplified)
                token = auth_header.replace("Bearer ", "")
                payload = jwt.decode(token, options={"verify_signature": False})
                user_id = payload.get("sub")
            except:
                pass
        
        # Rate limiting validation
        client_ip = request.client.host
        rate_limit_result = self.check_rate_limits(client_ip, user_id, path, method)
        if rate_limit_result:
            return rate_limit_result
        
        # Security validation
        security_result = self.check_security_violations(client_ip, user_id, path, method)
        if security_result:
            return security_result
        
        # Request size validation
        if method in ["POST", "PUT", "PATCH"]:
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
                return {
                    "is_valid": False,
                    "status_code": 413,
                    "level": "error",
                    "code": "REQUEST_TOO_LARGE",
                    "message": "Request payload too large",
                    "details": {"size": content_length, "max_size": "10MB"},
                    "suggested_action": "Reduce request size"
                }
        
        return None
    
    def check_rate_limits(self, client_ip: str, user_id: str, path: str, method: str) -> Dict[str, Any]:
        """Check rate limits for different endpoints"""
        current_time = time.time()
        
        # Define rate limits for different endpoints
        rate_limits = {
            "/api/auth/register": {"requests": 5, "window": 300},  # 5 per 5 minutes
            "/api/auth/login": {"requests": 10, "window": 300},    # 10 per 5 minutes
            "/api/projects": {"requests": 20, "window": 60},       # 20 per minute
            "/api/wallet/add-funds": {"requests": 5, "window": 300}, # 5 per 5 minutes
        }
        
        # Check for exact path matches or patterns
        rate_limit_config = None
        for endpoint, config in rate_limits.items():
            if path.startswith(endpoint):
                rate_limit_config = config
                break
        
        if not rate_limit_config:
            return None
        
        # Use user_id if available, otherwise use IP
        identifier = user_id or client_ip
        cache_key = f"{identifier}:{path}:{method}"
        
        if cache_key not in self.request_cache:
            self.request_cache[cache_key] = []
        
        # Clean old requests outside the window
        window_start = current_time - rate_limit_config["window"]
        self.request_cache[cache_key] = [
            req_time for req_time in self.request_cache[cache_key]
            if req_time > window_start
        ]
        
        # Check if rate limit exceeded
        if len(self.request_cache[cache_key]) >= rate_limit_config["requests"]:
            return {
                "is_valid": False,
                "status_code": 429,
                "level": "warning",
                "code": "RATE_LIMIT_EXCEEDED",
                "message": f"Rate limit exceeded for {path}",
                "details": {
                    "limit": rate_limit_config["requests"],
                    "window": rate_limit_config["window"],
                    "current_requests": len(self.request_cache[cache_key])
                },
                "suggested_action": f"Wait {rate_limit_config['window']} seconds before retrying"
            }
        
        # Add current request to cache
        self.request_cache[cache_key].append(current_time)
        return None
    
    def check_security_violations(self, client_ip: str, user_id: str, path: str, method: str) -> Dict[str, Any]:
        """Check for security violations and suspicious activity"""
        current_time = time.time()
        identifier = user_id or client_ip
        
        if identifier not in self.security_violations:
            self.security_violations[identifier] = {
                "failed_attempts": 0,
                "last_violation": 0,
                "violation_types": []
            }
        
        violations = self.security_violations[identifier]
        
        # Check for account lockout
        if violations["failed_attempts"] >= 10:
            time_since_last = current_time - violations["last_violation"]
            if time_since_last < 3600:  # 1 hour lockout
                return {
                    "is_valid": False,
                    "status_code": 403,
                    "level": "critical",
                    "code": "ACCOUNT_LOCKED",
                    "message": "Account temporarily locked due to suspicious activity",
                    "details": {
                        "lockout_time": 3600 - int(time_since_last),
                        "failed_attempts": violations["failed_attempts"]
                    },
                    "suggested_action": "Contact support or wait for lockout to expire"
                }
        
        # Check for suspicious patterns
        suspicious_patterns = [
            "/admin",
            "/wp-admin",
            "/.env",
            "/config",
            "/../",
            "<script",
            "SELECT * FROM",
            "DROP TABLE"
        ]
        
        for pattern in suspicious_patterns:
            if pattern.lower() in path.lower():
                violations["failed_attempts"] += 1
                violations["last_violation"] = current_time
                violations["violation_types"].append(f"suspicious_path:{pattern}")
                
                logger.warning(f"Suspicious request from {identifier}: {path}")
                
                return {
                    "is_valid": False,
                    "status_code": 403,
                    "level": "critical",
                    "code": "SUSPICIOUS_ACTIVITY",
                    "message": "Suspicious request pattern detected",
                    "details": {"pattern": pattern, "path": path},
                    "suggested_action": "Contact support if this is a legitimate request"
                }
        
        return None

# Validation decorators for specific endpoints
def validate_project_operation(func):
    """Decorator for project-related operations"""
    async def wrapper(*args, **kwargs):
        # Extract project_id and current_user from kwargs
        project_id = kwargs.get('project_id')
        current_user = kwargs.get('current_user')
        
        if project_id and current_user:
            # Additional project-specific validation can be added here
            pass
        
        return await func(*args, **kwargs)
    return wrapper

def validate_payment_operation(func):
    """Decorator for payment-related operations"""
    async def wrapper(*args, **kwargs):
        current_user = kwargs.get('current_user')
        
        if current_user:
            # Check for payment fraud patterns
            user_id = current_user["id"]
            
            # Additional payment-specific validation can be added here
            pass
        
        return await func(*args, **kwargs)
    return wrapper

def validate_training_operation(func):
    """Decorator for training-related operations"""
    async def wrapper(*args, **kwargs):
        project_id = kwargs.get('project_id')
        current_user = kwargs.get('current_user')
        training_request = kwargs.get('training_request')
        
        if all([project_id, current_user, training_request]):
            # Additional training-specific validation can be added here
            pass
        
        return await func(*args, **kwargs)
    return wrapper

# Global validation functions
def validate_user_permissions(user_id: str, resource_type: str, resource_id: str) -> bool:
    """Validate user permissions for specific resources"""
    try:
        if resource_type == "project":
            from app.utils.data import get_project_by_id
            project = get_project_by_id(resource_id)
            return project and project.get("user_id") == user_id
        
        return False
    except Exception as e:
        logger.error(f"Permission validation error: {e}")
        return False

def validate_business_rules(operation: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate business rules for operations"""
    try:
        if operation == "project_creation":
            return validation_service.validate_project_creation(user_id, data).to_dict()
        elif operation == "model_training":
            return validation_service.validate_model_training(
                user_id, data.get("project_id"), data.get("model_type"), data
            ).to_dict()
        elif operation == "chat_request":
            return validation_service.validate_chat_request(
                user_id, data.get("project_id"), data.get("message")
            ).to_dict()
        elif operation == "payment":
            return validation_service.validate_payment_operation(
                user_id, data.get("amount"), data.get("operation_type")
            ).to_dict()
        
        return {"is_valid": True, "message": "No specific validation required"}
    
    except Exception as e:
        logger.error(f"Business rule validation error: {e}")
        return {
            "is_valid": False,
            "level": "error",
            "message": f"Validation error: {str(e)}",
            "suggested_action": "Contact support"
        }

# Security monitoring functions
def log_security_event(event_type: str, user_id: str, details: Dict[str, Any]):
    """Log security events for monitoring"""
    security_log = {
        "timestamp": time.time(),
        "event_type": event_type,
        "user_id": user_id,
        "details": details
    }
    
    logger.warning(f"Security Event: {json.dumps(security_log)}")
    
    # In production, this would send to a security monitoring system
    # like Splunk, ELK stack, or cloud security services

