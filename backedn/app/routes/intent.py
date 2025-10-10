from flask import Blueprint, request, jsonify,send_file
import os
import json
from app.utils.security import token_required
from app.utils.data import get_project_by_id
from config import PROJECTS_DIR
from config import logger
from app.validation.validation_service import Validation_service, ValidationLevel
from app.validation.text_validation_middleware import TextValidator  

from werkzeug.utils import secure_filename
from app.utils.file_processing import process_multiple_file_formats

intent_bp = Blueprint('intent', __name__)

validation_service = Validation_service
text_validator = TextValidator()

# Intent Management Endpoints
@intent_bp.route('/projects/<project_id>/intents')
@token_required
def get_intents(current_user, project_id):
    try:
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
        
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if os.path.exists(intents_file):
            with open(intents_file, "r", encoding="utf-8") as file:
                return jsonify(json.load(file))
        return jsonify({"intents": []})
    except Exception as e:
        logger.error(f"Error getting intents: {e}")
        return jsonify({"error": "Failed to retrieve intents"}), 500

@intent_bp.route('/projects/<project_id>/intents', methods=['POST'])
@token_required
def add_intent(current_user, project_id):
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('tag', 'patterns', 'responses')):
            return jsonify({"error": "Missing required fields: tag, patterns, responses"}), 400

        validation_result = validation_service.validate_intent_creation(
            user_id=current_user["id"],
            project_id=project_id,
            intent_data={
                "tag": data["tag"],
                "patterns": data["patterns"],
                "responses": data["responses"]
            }
        )
        
        if not validation_result.is_valid:
            if validation_result.level == ValidationLevel.CRITICAL:
                logger.critical(f"Critical intent validation failure: {validation_result.message}")
                return jsonify(validation_result.to_dict()), 403
            elif validation_result.level == ValidationLevel.ERROR:
                return jsonify(validation_result.to_dict()), 400
            else:
                logger.warning(f"Intent validation warning: {validation_result.message}")
        
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
        
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        
        # Load existing intents
        if os.path.exists(intents_file):
            with open(intents_file, "r", encoding="utf-8") as file:
                intents_data = json.load(file)
        else:
            intents_data = {"intents": []}
        # Validate intent data structure
        validation_result = text_validator.validate_intent(data)
        
        if not validation_result['valid']:
            error_message = f"Invalid intent data: {', '.join(validation_result['issues'])}"
            return jsonify({"error": error_message}), 400
        # Check for duplicate tags
        existing_tags = [i["tag"] for i in intents_data["intents"]]
        if data["tag"] in existing_tags:
            return jsonify({"error": "Intent tag already exists"}), 400
        # Add new intent
        intents_data["intents"].append(data)
        
        # Log validation issues if any (warnings)
        if validation_result['issues']:
            logger.warning(f"Intent validation issues for project {project_id}: {validation_result['issues']}")
        
        # Save updated intents
        os.makedirs(os.path.dirname(intents_file), exist_ok=True)
        with open(intents_file, "w", encoding="utf-8") as file:
            json.dump(intents_data, file, ensure_ascii=False, indent=4)
        
        logger.info(f"Added intent to project {project_id}")
        return jsonify(data), 201
    except Exception as e:
        logger.error(f"Error adding intent: {e}")
        return jsonify({"error": "Failed to add intent"}), 500

@intent_bp.route('/projects/<project_id>/intents/<intent_tag>', methods=['PUT'])
@token_required
def update_intent(current_user, project_id, intent_tag):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided for update"}), 400
        
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
        
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        
        if not os.path.exists(intents_file):
            return jsonify({"error": "No intents found"}), 404
        
        with open(intents_file, "r", encoding="utf-8") as file:
            intents_data = json.load(file)
        
        # Find and update intent
        intent_found = False
        for i, existing_intent in enumerate(intents_data["intents"]):
            if existing_intent["tag"] == intent_tag:
                if data.get('tag') is not None:
                    existing_intent["tag"] = data['tag']
                if data.get('patterns') is not None:
                    existing_intent["patterns"] = data['patterns']
                if data.get('responses') is not None:
                    existing_intent["responses"] = data['responses']
                intent_found = True
                break
        
        if not intent_found:
            return jsonify({"error": "Intent not found"}), 404
        
        with open(intents_file, "w", encoding="utf-8") as file:
            json.dump(intents_data, file, ensure_ascii=False, indent=4)
        
        logger.info(f"Updated intent {intent_tag} in project {project_id}")
        return jsonify({"message": "Intent updated successfully"})
    except Exception as e:
        logger.error(f"Error updating intent: {e}")
        return jsonify({"error": "Failed to update intent"}), 500

@intent_bp.route('/projects/<project_id>/intents/<intent_tag>', methods=['DELETE'])
@token_required
def delete_intent(current_user, project_id, intent_tag):
    try:
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
        
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        
        if not os.path.exists(intents_file):
            return jsonify({"error": "No intents found"}), 404
        
        with open(intents_file, "r", encoding="utf-8") as file:
            intents_data = json.load(file)
        original_length = len(intents_data["intents"])
        intents_data["intents"] = [i for i in intents_data["intents"] if i["tag"] != intent_tag]
        
        if len(intents_data["intents"]) == original_length:
            return jsonify({"error": "Intent not found"}), 404
        
        with open(intents_file, "w", encoding="utf-8") as file:
            json.dump(intents_data, file, ensure_ascii=False, indent=4)
        
        logger.info(f"Deleted intent {intent_tag} from project {project_id}")
        return jsonify({"message": "Intent deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting intent: {e}")
        return jsonify({"error": "Failed to delete intent"}), 500


# File Import Endpoint
def _import_intents_logic(current_user, project_id, skip_user_check=False):
    """Shared logic for importing intents"""
    try:

        if not skip_user_check:
            project = get_project_by_id(project_id)
            if not project or project["user_id"] != current_user["id"]:
                return jsonify({"error": "Project not found"}), 404

        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join("/tmp", filename)
        file.save(temp_path)

        try:
            # Process the file
            imported_intents = process_multiple_file_formats(temp_path, filename)

            if not imported_intents:
                return jsonify({"error": "No valid intents found in file"}), 400

            # Load existing intents
            intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
            if os.path.exists(intents_file):
                with open(intents_file, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
            else:
                existing_data = {"intents": []}

            # Merge intents (avoid duplicates by tag)
            existing_tags = {intent["tag"] for intent in existing_data["intents"]}
            new_intents = []
            skipped_count = 0

            for intent in imported_intents:
                if intent["tag"] not in existing_tags:
                    new_intents.append(intent)
                    existing_tags.add(intent["tag"])
                else:
                    skipped_count += 1

            existing_data["intents"].extend(new_intents)

            # Save updated intents
            os.makedirs(os.path.dirname(intents_file), exist_ok=True)
            with open(intents_file, "w", encoding="utf-8") as f:
                json.dump(existing_data, f, ensure_ascii=False, indent=4)

            logger.info(f"Imported {len(new_intents)} intents to project {project_id}")

            return jsonify({
                "message": f"Successfully imported {len(new_intents)} intents",
                "imported_count": len(new_intents),
                "skipped_count": skipped_count,
                "total_intents": len(existing_data["intents"])
            })

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        logger.error(f"File import error for project {project_id}: {str(e)}")
        return jsonify({"error": f"File import failed: {str(e)}"}), 500

@intent_bp.route('/projects/<project_id>/import', methods=['POST'])
@token_required
def import_intents(current_user, project_id):
    """Import intents from file"""
    return _import_intents_logic(current_user, project_id)



@intent_bp.route('/projects/<project_id>/upload-intents', methods=['POST'])
@token_required
def upload_intents_bulk(current_user, project_id):
    """Bulk upload intents from file"""
    return _import_intents_logic(current_user, project_id)



@intent_bp.route('/public/projects/<project_id>/import', methods=['POST'])
def import_intents_public(project_id):
    """Public file import endpoint for testing (no auth required)"""
    dummy_user = {"id": "public", "name": "Public User", "email": "public@example.com"}
    return _import_intents_logic(dummy_user, project_id, skip_user_check=True)


# public endpoint to get intents
@intent_bp.route('/public/projects/<project_id>/intents')
def get_intents_public(project_id):
    """Public endpoint to get project intents (for testing)"""
    try:
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if os.path.exists(intents_file):
            with open(intents_file, "r", encoding="utf-8") as file:
                return jsonify(json.load(file))
        return jsonify({"intents": []})
    except Exception as e:
        logger.error(f"Error getting public intents: {e}")
        return jsonify({"error": "Failed to retrieve intents"}), 500

# File serving endpoint for uploaded files
@intent_bp.route('/projects/<project_id>/uploads/<filename>')
def serve_uploaded_file(project_id, filename):
    """Serve uploaded files like avatars"""
    try:
        uploads_dir = os.path.join(PROJECTS_DIR, project_id, "uploads")
        file_path = os.path.join(uploads_dir, filename)
        
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_file(file_path)
        else:
            return jsonify({"error": "File not found"}), 404
            
    except Exception as e:
        logger.error(f"Error serving uploaded file: {e}")
        return jsonify({"error": "Failed to serve file"}), 500