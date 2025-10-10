#app/routes/dashboard.py
import os
import json
from flask import Blueprint, request, jsonify
from app.utils.security import token_required
from app.utils.data import load_projects
from app.models import db, Project
from config import PROJECTS_DIR
from config import logger
from datetime import datetime

dashboard_bp = Blueprint('dashboard', __name__)



# Analytics Endpoints
@dashboard_bp.route('/projects/<project_id>/analytics')
@token_required
def get_project_analytics(current_user, project_id):
    """Get analytics data for a specific project"""
    try:
        # Use database directly
        project_db = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project_db:
            return jsonify({"error": "Project not found"}), 404
        
        project = project_db.to_dict()
        project_dir = os.path.join(PROJECTS_DIR, project_id)
    
        analytics = {
            "project_id": project_id,
            "project_name": project.get("name", "Unknown"),
            "created_at": project.get("created_at"),
            "training_status": project.get("training_status", "untrained"),
            "model_type": project.get("model_type", "basic"),
            "accuracy": project.get("accuracy", 0),
            "total_intents": 0,
            "total_patterns": 0,
            "total_responses": 0,
            "conversations_count": 0,  # Placeholder - would need chat logging
            "most_common_intents": [],  # Placeholder
            "accuracy_trend": [],  # Placeholder
            "usage_stats": {
                "daily_conversations": 0,
                "weekly_conversations": 0,
                "monthly_conversations": 0
            },
            "performance_metrics": {
                "average_response_time": 0.5,  # Placeholder
                "confidence_distribution": {
                    "high": 70,  # >0.8
                    "medium": 25,  # 0.5-0.8
                    "low": 5  # <0.5
                }
            }
        }
        # Load intents data for analytics
        intents_file = os.path.join(project_dir, "intents.json")
        if os.path.exists(intents_file):
            try:
                with open(intents_file, "r", encoding="utf-8") as f:
                    intents_data = json.load(f)
                
                intents = intents_data.get("intents", [])
                analytics["total_intents"] = len(intents)
                
                total_patterns = sum(len(intent.get("patterns", [])) for intent in intents)
                total_responses = sum(len(intent.get("responses", [])) for intent in intents)
                
                analytics["total_patterns"] = total_patterns
                analytics["total_responses"] = total_responses
                
                # Example: Most common intents by number of patterns
                intent_stats = [
                    {
                        "tag": intent.get("tag", ""),
                        "pattern_count": len(intent.get("patterns", [])),
                        "response_count": len(intent.get("responses", []))
                    }
                    for intent in intents
                ]
                analytics["most_common_intents"] = sorted(
                    intent_stats, 
                    key=lambda x: x["pattern_count"], 
                    reverse=True
                )[:5]
                
            except Exception as e:
                logger.warning(f"Error loading intents for analytics: {e}")
        
        return jsonify(analytics)
        
    except Exception as e:
        logger.error(f"Error getting project analytics: {e}")
        return jsonify({"error": "Failed to get project analytics"}), 500

@dashboard_bp.route('/dashboard/stats')
@token_required
def get_dashboard_stats(current_user):
    """Get dashboard statistics for the current user"""
    try:
        # Use database directly instead of load_projects()
        user_projects_db = Project.query.filter_by(user_id=current_user["id"]).all()
        user_projects = [p.to_dict() for p in user_projects_db]
        
        # Calculate dashboard statistics
        total_projects = len(user_projects)
        trained_models = len([p for p in user_projects if p.get("training_status") == "trained"])
        
        # Calculate average accuracy
        accuracies = [p.get("accuracy", 0) for p in user_projects if p.get("accuracy")]
        average_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
        
        # Count by model type
        model_types = {}
        for project in user_projects:
            model_type = project.get("model_type", "basic")
            model_types[model_type] = model_types.get(model_type, 0) + 1
        
        # Add model type descriptions
        model_type_info = {
            "basic": {"name": "Basic", "technology": "Neural Network", "count": model_types.get("basic", 0)},
            "medium": {"name": "Medium", "technology": "BERT", "count": model_types.get("medium", 0)},
            "advanced": {"name": "Advanced", "technology": "RoBERTa", "count": model_types.get("advanced", 0)}
        }
        
        # Count by training status
        training_statuses = {}
        for project in user_projects:
            status = project.get("training_status", "untrained")
            training_statuses[status] = training_statuses.get(status, 0) + 1
        
        # Recent activity (last 7 days)
        from datetime import datetime, timedelta
        week_ago = datetime.now() - timedelta(days=7)
        recent_projects = [
            p for p in user_projects 
            if p.get("updated_at") and datetime.fromisoformat(p["updated_at"].replace("Z", "+00:00")) > week_ago
        ]
        
        stats = {
            "user_id": current_user["id"],
            "total_projects": total_projects,
            "trained_models": trained_models,
            "untrained_models": total_projects - trained_models,
            "average_accuracy": round(average_accuracy, 2),
            "total_conversations": 0,  # Placeholder - would need chat logging
            "active_projects": len(recent_projects),
            "system_health": "healthy",
            "model_distribution": model_types,
            "model_type_info": model_type_info,
            "training_status_distribution": training_statuses,
            "recent_activity": {
                "projects_created_this_week": len([
                    p for p in user_projects 
                    if p.get("created_at") and datetime.fromisoformat(p["created_at"].replace("Z", "+00:00")) > week_ago
                ]),
                "projects_trained_this_week": len([
                    p for p in recent_projects 
                    if p.get("training_status") == "trained"
                ]),
                "total_intents": sum([
                    len(_get_project_intents(p["id"])) 
                    for p in user_projects
                ]) if user_projects else 0
            },
            "performance_summary": {
                "best_accuracy": max(accuracies) if accuracies else 0,
                "worst_accuracy": min(accuracies) if accuracies else 0,
                "accuracy_trend": "stable"  # Placeholder
            }
        }
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return jsonify({"error": "Failed to get dashboard statistics"}), 500

def _get_project_intents(project_id: str) -> list:
    """Helper function to get intents for a project"""
    try:
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if os.path.exists(intents_file):
            with open(intents_file, "r", encoding="utf-8") as f:
                intents_data = json.load(f)
            return intents_data.get("intents", [])
    except Exception:
        pass
    return []

# System Status and Prediction Endpoints (for frontend compatibility)
@dashboard_bp.route('/status')
def get_system_status():
    """Get system status"""
    try:
        import psutil
        
        return jsonify({
            "status": "healthy",
            "uptime": 0,  # You can implement actual uptime tracking
            "models_loaded": Project.query.count(),
            "active_sessions": 0,  # You can implement session tracking
            "memory_usage": psutil.virtual_memory().percent,
            "cpu_usage": psutil.cpu_percent(),
            "last_updated": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting system status: {str(e)}")
        return jsonify({
            "status": "healthy",
            "uptime": 0,
            "models_loaded": 0,
            "active_sessions": 0,
            "memory_usage": 0,
            "cpu_usage": 0,
            "last_updated": datetime.utcnow().isoformat()
        })

@dashboard_bp.route('/history')
def get_prediction_history():
    """Get prediction history (placeholder)"""
    limit = request.args.get('limit', 10, type=int)
    # This is a placeholder - you can implement actual history tracking
    return jsonify([])

@dashboard_bp.route('/predict', methods=['POST'])
def predict_image():
    """Image prediction endpoint (placeholder)"""
    try:
        # This is a placeholder for image prediction functionality
        # You can implement actual image processing here

        return jsonify({
            "predicted_text": "Sample prediction result",
            "confidence": 0.95,
            "processing_time": 0.1,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error in image prediction: {str(e)}")
        return jsonify({"error": "Prediction failed"}), 500

# Feedback Endpoints
@dashboard_bp.route('/projects/<project_id>/feedback')
@token_required
def get_project_feedback(current_user, project_id):
    """Get feedback data for a specific project"""
    try:
        # Verify project ownership using database
        project_db = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project_db:
            return jsonify({"error": "Project not found"}), 404

        # Load feedback data
        project_dir = os.path.join(PROJECTS_DIR, project_id)
        feedback_file = os.path.join(project_dir, "feedback.json")

        if not os.path.exists(feedback_file):
            return jsonify([])

        try:
            with open(feedback_file, "r", encoding="utf-8") as f:
                feedback_data = json.load(f)

            # Ensure it's a list
            if isinstance(feedback_data, list):
                return jsonify(feedback_data)
            else:
                return jsonify([])

        except Exception as e:
            logger.warning(f"Error loading feedback for project {project_id}: {e}")
            return jsonify([])

    except Exception as e:
        logger.error(f"Error getting project feedback: {e}")
        return jsonify({"error": "Failed to get project feedback"}), 500
