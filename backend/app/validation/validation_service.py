# Simplified Validation Service - Free Version
import logging
from typing import Dict, Any, Tuple, Optional, List
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class ValidationLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class ValidationCode(str, Enum):
    # Business Logic Validations
    TRAINING_DATA_INSUFFICIENT = "TRAINING_DATA_INSUFFICIENT"
    PROJECT_NOT_READY = "PROJECT_NOT_READY"
    CONCURRENT_OPERATION = "CONCURRENT_OPERATION"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    
    # Security Validations
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY"
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED"
    
    # Success Code
    VALIDATION_PASSED = "VALIDATION_PASSED"

@dataclass
class ValidationResult:
    is_valid: bool
    level: ValidationLevel
    code: ValidationCode
    message: str
    details: Dict[str, Any]
    suggested_action: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "level": self.level.value,
            "code": self.code.value,
            "message": self.message,
            "details": self.details,
            "suggested_action": self.suggested_action
        }

class FreeValidationService:
    def __init__(self):
        self.rate_limit_cache = {}
    
    def validate_project_creation(self, user_id: str, project_data: Dict[str, Any]) -> ValidationResult:
        """Simple validation for project creation - Free version"""
        logger.info(f"Validating project creation for user {user_id}")
        
        # Check rate limiting (prevent spam project creation)
        rate_limit_key = f"project_creation_{user_id}"
        current_time = datetime.utcnow()
        
        if rate_limit_key in self.rate_limit_cache:
            last_creation = self.rate_limit_cache[rate_limit_key]
            if current_time - last_creation < timedelta(seconds=30):  # 30 second cooldown
                return ValidationResult(
                    is_valid=False,
                    level=ValidationLevel.WARNING,
                    code=ValidationCode.RATE_LIMIT_EXCEEDED,
                    message="Please wait before creating another project",
                    details={"wait_time": "30 seconds"},
                    suggested_action="Wait 30 seconds between project creations"
                )
        
        self.rate_limit_cache[rate_limit_key] = current_time
        
        # Validate project data
        required_fields = ["name", "type"]
        for field in required_fields:
            if not project_data.get(field):
                return ValidationResult(
                    is_valid=False,
                    level=ValidationLevel.ERROR,
                    code=ValidationCode.PROJECT_NOT_READY,
                    message=f"Missing required field: {field}",
                    details={"missing_field": field},
                    suggested_action=f"Please provide a valid {field}"
                )
        
        # Basic project limit for free users (generous limit)
        from app.utils.data import get_projects_by_user
        user_projects = get_projects_by_user(user_id)
        
        if len(user_projects) >= 100:  # Very generous limit for free users
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.WARNING,
                code=ValidationCode.SUSPICIOUS_ACTIVITY,
                message="You have reached the maximum number of projects",
                details={"project_count": len(user_projects)},
                suggested_action="Please delete unused projects to create new ones"
            )
        
        return ValidationResult(
            is_valid=True,
            level=ValidationLevel.INFO,
            code=ValidationCode.VALIDATION_PASSED,
            message="Project creation validation passed",
            details={"projects_count": len(user_projects)},
            suggested_action="Proceed with project creation"
        )
    
    def validate_model_training(self, user_id: str, project_id: str, model_type: str, 
                              training_config: Dict[str, Any]) -> ValidationResult:
        """Simple validation for model training - Free version"""
        logger.info(f"Validating model training for user {user_id}, project {project_id}, model {model_type}")
        
        # Check if project exists and belongs to user
        from app.utils.data import get_project_by_id
        project = get_project_by_id(project_id)
        if project and project.get("user_id") != user_id:
            project = None
        
        if not project:
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.PROJECT_NOT_READY,
                message="Project not found or access denied",
                details={"project_id": project_id, "user_id": user_id},
                suggested_action="Verify project ownership and try again"
            )
        
        # Check if project has sufficient training data
        import os
        project_dir = os.path.join("data/chatbots", project_id)
        intents_file = os.path.join(project_dir, "intents.json")
        
        if not os.path.exists(intents_file):
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.TRAINING_DATA_INSUFFICIENT,
                message="No training data found",
                details={"project_id": project_id},
                suggested_action="Add intents and training data before training"
            )
        
        try:
            import json
            with open(intents_file, "r", encoding="utf-8") as f:
                intents_data = json.load(f)
            
            intents = intents_data.get("intents", [])
            if len(intents) < 2:
                return ValidationResult(
                    is_valid=False,
                    level=ValidationLevel.ERROR,
                    code=ValidationCode.TRAINING_DATA_INSUFFICIENT,
                    message=f"Insufficient training data: {len(intents)} intents (minimum 2 required)",
                    details={"intent_count": len(intents), "minimum_required": 2},
                    suggested_action="Add more intents with diverse patterns and responses"
                )
            
            # Check data quality
            total_patterns = sum(len(intent.get("patterns", [])) for intent in intents)
            if total_patterns < 5:  # More lenient for free version
                return ValidationResult(
                    is_valid=False,
                    level=ValidationLevel.WARNING,
                    code=ValidationCode.TRAINING_DATA_INSUFFICIENT,
                    message=f"Limited training patterns: {total_patterns} (recommended: 10+)",
                    details={"pattern_count": total_patterns, "recommended": 10},
                    suggested_action="Add more diverse patterns for better model accuracy"
                )
                
        except Exception as e:
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.TRAINING_DATA_INSUFFICIENT,
                message=f"Error reading training data: {str(e)}",
                details={"error": str(e)},
                suggested_action="Check training data format and try again"
            )
        
        # Check for concurrent training operations
        if project.get("training_status") == "training":
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.WARNING,
                code=ValidationCode.CONCURRENT_OPERATION,
                message="Training already in progress for this project",
                details={"project_id": project_id, "current_status": "training"},
                suggested_action="Wait for current training to complete"
            )
        
        # Rate limiting for training (more lenient for free version)
        rate_limit_key = f"model_training_{user_id}"
        current_time = datetime.utcnow()
        
        if rate_limit_key in self.rate_limit_cache:
            last_training = self.rate_limit_cache[rate_limit_key]
            if current_time - last_training < timedelta(minutes=2):  # Reduced from 5 to 2 minutes
                return ValidationResult(
                    is_valid=False,
                    level=ValidationLevel.WARNING,
                    code=ValidationCode.RATE_LIMIT_EXCEEDED,
                    message="Please wait before starting another training session",
                    details={"wait_time": "2 minutes"},
                    suggested_action="Wait 2 minutes between training sessions"
                )
        
        self.rate_limit_cache[rate_limit_key] = current_time
        
        return ValidationResult(
            is_valid=True,
            level=ValidationLevel.INFO,
            code=ValidationCode.VALIDATION_PASSED,
            message="Model training validation passed",
            details={
                "model_type": model_type,
                "intent_count": len(intents),
                "pattern_count": total_patterns
            },
            suggested_action="Proceed with model training"
        )
    
    def validate_chat_request(self, user_id: str, project_id: str, message: str) -> ValidationResult:
        """Validate chat/inference request - Free version"""
        logger.debug(f"Validating chat request for user {user_id}, project {project_id}")
        
        # Check project access
        from app.utils.data import get_project_by_id
        project = get_project_by_id(project_id)
        
        if not project:
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.PROJECT_NOT_READY,
                message="Project not found",
                details={"project_id": project_id},
                suggested_action="Verify project exists and is accessible"
            )
        
        # Check if project is trained (more lenient - allow basic functionality even without training)
        if project.get("training_status") not in ["trained", "not_trained"]:
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.WARNING,
                code=ValidationCode.PROJECT_NOT_READY,
                message="Project is currently being trained",
                details={"training_status": project.get("training_status", "unknown")},
                suggested_action="Wait for training to complete"
            )
        
        # Rate limiting for chat requests (more lenient)
        rate_limit_key = f"chat_requests_{user_id}"
        current_time = datetime.utcnow()
        
        if rate_limit_key in self.rate_limit_cache:
            last_request = self.rate_limit_cache[rate_limit_key]
            if current_time - last_request < timedelta(milliseconds=500):  # 0.5 seconds instead of 1
                return ValidationResult(
                    is_valid=False,
                    level=ValidationLevel.WARNING,
                    code=ValidationCode.RATE_LIMIT_EXCEEDED,
                    message="Too many requests. Please slow down.",
                    details={"rate_limit": "2 requests per second"},
                    suggested_action="Wait a moment between requests"
                )
        
        self.rate_limit_cache[rate_limit_key] = current_time
        
        # Validate message content
        if not message or not message.strip():
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.PROJECT_NOT_READY,
                message="Empty message not allowed",
                details={"message_length": len(message) if message else 0},
                suggested_action="Provide a valid message"
            )
        
        if len(message) > 2000:  # More generous limit
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.PROJECT_NOT_READY,
                message="Message too long (max 2000 characters)",
                details={"message_length": len(message), "max_length": 2000},
                suggested_action="Shorten your message"
            )
        
        return ValidationResult(
            is_valid=True,
            level=ValidationLevel.INFO,
            code=ValidationCode.VALIDATION_PASSED,
            message="Chat request validation passed",
            details={"project_id": project_id, "message_length": len(message)},
            suggested_action="Proceed with chat request"
        )
    
    def validate_intent_creation(self, user_id: str, project_id: str, intent_data: Dict[str, Any]) -> ValidationResult:
        """Validate intent creation - Free version"""
        logger.debug(f"Validating intent creation for user {user_id}, project {project_id}")
        
        # Check project ownership
        from app.utils.data import get_project_by_id
        project = get_project_by_id(project_id)
        if project and project.get("user_id") != user_id:
            project = None
        
        if not project:
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.PROJECT_NOT_READY,
                message="Project not found or access denied",
                details={"project_id": project_id},
                suggested_action="Verify project ownership"
            )
        
        # Generous intent limits for free users
        import os, json
        project_dir = os.path.join("data/chatbots", project_id)
        intents_file = os.path.join(project_dir, "intents.json")
        
        current_intents = 0
        if os.path.exists(intents_file):
            try:
                with open(intents_file, "r", encoding="utf-8") as f:
                    intents_data = json.load(f)
                current_intents = len(intents_data.get("intents", []))
            except:
                pass
        
        if current_intents >= 1000:  # Very generous limit
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.WARNING,
                code=ValidationCode.SUSPICIOUS_ACTIVITY,
                message=f"You have reached the maximum number of intents per project",
                details={"current_intents": current_intents},
                suggested_action="Consider organizing intents or creating a new project"
            )
        
        # Validate intent data structure
        required_fields = ["tag", "patterns", "responses"]
        for field in required_fields:
            if field not in intent_data:
                return ValidationResult(
                    is_valid=False,
                    level=ValidationLevel.ERROR,
                    code=ValidationCode.PROJECT_NOT_READY,
                    message=f"Missing required field: {field}",
                    details={"missing_field": field},
                    suggested_action=f"Provide {field} for the intent"
                )
        
        # Validate patterns and responses
        patterns = intent_data.get("patterns", [])
        responses = intent_data.get("responses", [])
        
        if not patterns or len(patterns) == 0:
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.TRAINING_DATA_INSUFFICIENT,
                message="Intent must have at least one pattern",
                details={"pattern_count": len(patterns)},
                suggested_action="Add training patterns for this intent"
            )
        
        if not responses or len(responses) == 0:
            return ValidationResult(
                is_valid=False,
                level=ValidationLevel.ERROR,
                code=ValidationCode.TRAINING_DATA_INSUFFICIENT,
                message="Intent must have at least one response",
                details={"response_count": len(responses)},
                suggested_action="Add responses for this intent"
            )
        
        return ValidationResult(
            is_valid=True,
            level=ValidationLevel.INFO,
            code=ValidationCode.VALIDATION_PASSED,
            message="Intent creation validation passed",
            details={
                "tag": intent_data.get("tag"),
                "pattern_count": len(patterns),
                "response_count": len(responses)
            },
            suggested_action="Proceed with intent creation"
        )

# Global validation service instance
Validation_service = FreeValidationService()
