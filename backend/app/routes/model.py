import logging
import os
import datetime
from flask import Blueprint, request, jsonify,send_file
from app.utils.security import token_required
from chatbot_model.models.transformer_models import(
    get_available_transformer_models,
    train_transformer_model,
    predict_with_transformer,
    get_transformer_status,
    check_model_requirements
)
from app.utils.data import load_projects, save_projects
from werkzeug.utils import secure_filename
from app.validation.validation_service import Validation_service, ValidationLevel
from config import logger


model_bp = Blueprint('model', __name__)


# Get Available Models Endpoint
@model_bp.route('/models/available')
def get_available_models():
    """Get list of available transformer models with enhanced information"""
    try:
        models_info = get_available_transformer_models()
        return jsonify(models_info)
    except Exception as e:
        logger.error(f"Error getting available models: {e}")
        return jsonify({"error": "Failed to get available models"}), 500

@model_bp.route('/models/status')
def get_transformer_system_status():
    """Get detailed transformer system status and diagnostics"""
    try:
        status = get_transformer_status()
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error getting transformer status: {e}")
        return jsonify({"error": "Failed to get system status"}), 500

@model_bp.route('/models/<model_type>/requirements')
def check_model_type_requirements(model_type):
    """Check requirements for specific model type"""
    try:
        requirements = check_model_requirements(model_type)
        return jsonify(requirements)
    except Exception as e:
        logger.error(f"Error checking model requirements for {model_type}: {e}")
        return jsonify({"error": f"Failed to check requirements for {model_type}"}), 500


@model_bp.route('/projects/<project_id>/models/select', methods=['POST'])
@token_required
def select_model_type(current_user, project_id):
    """Select model type for a project"""
    try:
        data = request.get_json()
        
        projects = load_projects()
        project_index = next((i for i, p in enumerate(projects) if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        if project_index is None:
            return jsonify({"error": "Project not found"}), 404
        
        model_type = data.get("model_type", "basic")
        if model_type not in ["basic", "advanced", "transformer"]:
            return jsonify({"error": "Invalid model type"}), 400
        
        projects[project_index]["model_type"] = model_type
        projects[project_index]["updated_at"] = datetime.utcnow().isoformat()
        
        save_projects(projects)
        
        return jsonify({
            "project_id": project_id,
            "model_type": model_type,
            "message": f"Model type set to {model_type}"
        })
    except Exception as e:
        logger.error(f"Error selecting model type: {e}")
        return jsonify({"error": "Failed to select model type"}), 500

@model_bp.route('/projects/<project_id>/models/train', methods=['POST'])
@token_required
def train_model(current_user, project_id):
    """Train the model for a project"""
    try:
        projects = load_projects()
        project_index = next((i for i, p in enumerate(projects) if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        if project_index is None:
            return jsonify({"error": "Project not found"}), 404
        
        project = projects[project_index]
        model_type = project.get("model_type", "basic")
        
        if model_type != "transformer":
            return jsonify({"error": "Training only supported for transformer models"}), 400
        
        training_result = train_transformer_model(project_id)
        
        if not training_result.get("success", False):
            return jsonify({"error": "Training failed", "details": training_result.get("error", "Unknown error")}), 500
        
        project["model_trained_at"] = datetime.utcnow().isoformat()
        projects[project_index] = project
        save_projects(projects)
        
        return jsonify({
            "project_id": project_id,
            "message": "Model training initiated",
            "training_details": training_result
        })
    except Exception as e:
        logger.error(f"Error training model: {e}")
        return jsonify({"error": "Failed to train model"}), 500