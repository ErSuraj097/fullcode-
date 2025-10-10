import os
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.utils.security import token_required
from app.utils.data import get_project_by_id, update_project as update_project_db
from config import PROJECTS_DIR
from config import logger
from app.utils.default_chatbot import get_default_chatbot_config

chatbot_bp = Blueprint('chatbot', __name__)

# Chatbot Configuration Endpoints
@chatbot_bp.route('/projects/<project_id>/config')
@token_required
def get_chatbot_config(current_user, project_id):
    try:
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
        
        # Return config from database or default config
        config = project.get("config")
        if config:
            return jsonify(config)
        
        # Fallback to file-based config if exists
        config_file = os.path.join(PROJECTS_DIR, project_id, "config.json")
        if os.path.exists(config_file):
            with open(config_file, "r", encoding="utf-8") as f:
                return jsonify(json.load(f))
        
        return jsonify(get_default_chatbot_config())
    except Exception as e:
        logger.error(f"Error getting config: {e}")
        return jsonify({"error": "Failed to retrieve configuration"}), 500

@chatbot_bp.route('/projects/<project_id>/config', methods=['PUT'])
@token_required
def update_chatbot_config(current_user, project_id):
    try:
        data = request.get_json()   
        if not data:
            return jsonify({"error": "No configuration data provided"}), 400
        
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
    
        # Save config to file (for backward compatibility)
        config_file = os.path.join(PROJECTS_DIR, project_id, "config.json")
        os.makedirs(os.path.dirname(config_file), exist_ok=True)
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    
        # Update config in database
        updated_project = update_project_db(project_id, {"config": data})
        if not updated_project:
            return jsonify({"error": "Failed to update configuration"}), 500
        
        logger.info(f"Updated config for project {project_id}")
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error updating config: {e}")
        return jsonify({"error": "Failed to update configuration"}), 500
