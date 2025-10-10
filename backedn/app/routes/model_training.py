"""
Enhanced Model Training Routes with Model Type Selection
Supports Basic, Medium (BERT), and Advanced models with separate APIs
"""

import os
import json
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from functools import wraps
from app.utils.security import token_required
from app.models import db, Project
from config import PROJECTS_DIR
from chatbot_model.models.transformer_models import TransformerChatbot, ModelRegistry
from chatbot_model.models.advanced_model import AdvancedModelTrainer, TrainingConfig
from chatbot_model.utils.train_utils import train_model

model_training_bp = Blueprint('model_training', __name__)
logger = logging.getLogger(__name__)

# Model Type Selection Endpoint
@model_training_bp.route('/projects/<project_id>/model/select', methods=['POST'])
@token_required
def select_model_type(current_user, project_id):
    """Select model type for a project"""
    try:
        data = request.get_json()
        model_type = data.get('model_type', 'basic')
        
        # Validate model type
        if model_type not in ['basic', 'medium', 'advanced']:
            return jsonify({"error": "Invalid model type. Must be basic, medium, or advanced"}), 400
        
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Update project model type
        project.model_type = model_type
        project.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Get model info
        model_info = ModelRegistry.get_available_models().get(model_type, {})
        
        return jsonify({
            "message": f"Model type set to {model_type}",
            "project_id": project_id,
            "model_type": model_type,
            "model_info": model_info
        })
        
    except Exception as e:
        logger.error(f"Error selecting model type: {e}")
        return jsonify({"error": f"Failed to select model type: {str(e)}"}), 500

# Basic Model Training
@model_training_bp.route('/projects/<project_id>/train/basic', methods=['POST'])
@token_required
def train_basic_model(current_user, project_id):
    """Train project with basic model (fast, simple)"""
    try:
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Check for intents data
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if not os.path.exists(intents_file):
            return jsonify({"error": "No training data found. Please add intents first."}), 400
        
        with open(intents_file, "r", encoding="utf-8") as f:
            intents_data = json.load(f)
        
        if not intents_data.get("intents"):
            return jsonify({"error": "No intents found for training"}), 400
        
        # Update project status
        project.training_status = "training"
        project.model_type = "basic"
        db.session.commit()
        
        start_time = datetime.utcnow()
        
        try:
            # Use basic training method
            result = train_model(project_id)
            accuracy = float(result.get("accuracy", 0)) if result.get("accuracy") is not None else 0.75
            
            # Update project with results
            project.training_status = "trained"
            project.model_type = "basic"
            project.accuracy = accuracy
            project.updated_at = datetime.utcnow()
            db.session.commit()
            
            training_time = (datetime.utcnow() - start_time).total_seconds()
            
            return jsonify({
                "message": "Basic model trained successfully",
                "model_type": "basic",
                "accuracy": accuracy,
                "training_time": training_time,
                "project_status": "basic"
            })
            
        except Exception as training_error:
            project.training_status = "error"
            db.session.commit()
            raise training_error
            
    except Exception as e:
        logger.error(f"Basic model training error: {e}")
        return jsonify({"error": f"Basic model training failed: {str(e)}"}), 500

# Medium Model Training (BERT-based)
@model_training_bp.route('/projects/<project_id>/train/medium', methods=['POST'])
@token_required
def train_medium_model(current_user, project_id):
    """Train project with medium model (BERT-based, balanced performance)"""
    try:
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Check for intents data
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if not os.path.exists(intents_file):
            return jsonify({"error": "No training data found. Please add intents first."}), 400
        
        with open(intents_file, "r", encoding="utf-8") as f:
            intents_data = json.load(f)
        
        if not intents_data.get("intents"):
            return jsonify({"error": "No intents found for training"}), 400
        
        # Update project status
        project.training_status = "training"
        project.model_type = "medium"
        db.session.commit()
        
        start_time = datetime.utcnow()
        
        try:
            # Use transformer model with BERT
            chatbot = TransformerChatbot(model_type="medium")
            result = chatbot.train(intents_data, project_id)
            
            accuracy = result.get("accuracy", 0.8)
            
            # Update project with results
            project.training_status = "trained"
            project.model_type = "medium"
            project.accuracy = accuracy
            project.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                "message": "Medium model (BERT) trained successfully",
                "model_type": "medium",
                "accuracy": accuracy,
                "training_time": result.get("training_time", 0),
                "project_status": "medium",
                "technology": "BERT",
                "details": result
            })
            
        except Exception as training_error:
            project.training_status = "error"
            db.session.commit()
            raise training_error
            
    except Exception as e:
        logger.error(f"Medium model training error: {e}")
        return jsonify({"error": f"Medium model training failed: {str(e)}"}), 500

# Advanced Model Training
@model_training_bp.route('/projects/<project_id>/train/advanced', methods=['POST'])
@token_required
def train_advanced_model(current_user, project_id):
    """Train project with advanced model (RoBERTa-based, high performance)"""
    try:
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Check for intents data
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if not os.path.exists(intents_file):
            return jsonify({"error": "No training data found. Please add intents first."}), 400
        
        with open(intents_file, "r", encoding="utf-8") as f:
            intents_data = json.load(f)
        
        if not intents_data.get("intents"):
            return jsonify({"error": "No intents found for training"}), 400
        
        # Update project status
        project.training_status = "training"
        project.model_type = "advanced"
        db.session.commit()
        
        start_time = datetime.utcnow()
        
        try:
            # Use advanced transformer model with RoBERTa
            chatbot = TransformerChatbot(model_type="advanced")
            result = chatbot.train(intents_data, project_id)
            
            accuracy = result.get("accuracy", 0.85)
            
            # Update project with results
            project.training_status = "trained"
            project.model_type = "advanced"
            project.accuracy = accuracy
            project.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                "message": "Advanced model (RoBERTa) trained successfully",
                "model_type": "advanced",
                "accuracy": accuracy,
                "training_time": result.get("training_time", 0),
                "project_status": "advanced",
                "technology": "RoBERTa",
                "details": result
            })
            
        except Exception as training_error:
            project.training_status = "error"
            db.session.commit()
            raise training_error
            
    except Exception as e:
        logger.error(f"Advanced model training error: {e}")
        return jsonify({"error": f"Advanced model training failed: {str(e)}"}), 500

# Get Available Models
@model_training_bp.route('/models/available', methods=['GET'])
def get_available_models():
    """Get list of available model types with descriptions"""
    try:
        models = ModelRegistry.get_available_models()
        
        # Add additional information
        enhanced_models = {}
        for model_type, info in models.items():
            enhanced_models[model_type] = {
                **info,
                "technology": {
                    "basic": "Neural Network",
                    "medium": "BERT",
                    "advanced": "RoBERTa"
                }.get(model_type, "Unknown"),
                "use_case": {
                    "basic": "Simple chatbots, quick deployment",
                    "medium": "Business chatbots, balanced performance",
                    "advanced": "Complex conversations, high accuracy"
                }.get(model_type, "General purpose")
            }
        
        return jsonify({
            "models": enhanced_models,
            "total": len(enhanced_models)
        })
        
    except Exception as e:
        logger.error(f"Error getting available models: {e}")
        return jsonify({"error": "Failed to get available models"}), 500

# Get Model Status for Project
@model_training_bp.route('/projects/<project_id>/model/status', methods=['GET'])
@token_required
def get_project_model_status(current_user, project_id):
    """Get current model status for a project"""
    try:
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Get model info
        model_type = project.model_type or "basic"
        model_info = ModelRegistry.get_available_models().get(model_type, {})
        
        status = {
            "project_id": project_id,
            "model_type": model_type,
            "training_status": project.training_status,
            "accuracy": project.accuracy or 0.0,
            "last_trained": project.updated_at.isoformat() if project.updated_at else None,
            "model_info": model_info,
            "technology": {
                "basic": "Neural Network",
                "medium": "BERT",
                "advanced": "RoBERTa"
            }.get(model_type, "Unknown")
        }
        
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        return jsonify({"error": "Failed to get model status"}), 500

# Training Progress Endpoint
@model_training_bp.route('/projects/<project_id>/training/progress', methods=['GET'])
@token_required
def get_training_progress(current_user, project_id):
    """Get real-time training progress"""
    try:
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Get progress from training tracker if available
        try:
            from app.utils.training_progress import training_progress_tracker
            progress_data = training_progress_tracker.get_progress(project_id)
            
            if progress_data:
                return jsonify({
                    "project_id": project_id,
                    "model_type": project.model_type,
                    "training_status": project.training_status,
                    "progress": progress_data.get("progress", 0),
                    "current_epoch": progress_data.get("current_epoch", 0),
                    "total_epochs": progress_data.get("total_epochs", 0),
                    "estimated_completion": progress_data.get("estimated_completion"),
                    "message": progress_data.get("message", "")
                })
        except ImportError:
            pass
        
        # Default progress based on training status
        progress_map = {
            "not_trained": 0,
            "training": 50,
            "trained": 100,
            "error": 0
        }
        
        return jsonify({
            "project_id": project_id,
            "model_type": project.model_type,
            "training_status": project.training_status,
            "progress": progress_map.get(project.training_status, 0),
            "message": f"Model status: {project.training_status}"
        })
        
    except Exception as e:
        logger.error(f"Error getting training progress: {e}")
        return jsonify({"error": "Failed to get training progress"}), 500