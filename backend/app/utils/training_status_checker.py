"""
Training Status Checker Utility
Checks actual model files and updates training status accordingly
"""

import os
import logging
from config import PROJECTS_DIR

logger = logging.getLogger(__name__)

def check_and_update_training_status(project_id, projects):
    """Check if model files exist and update training status accordingly"""
    try:
        project_dir = os.path.join(PROJECTS_DIR, project_id)
        # Also check the legacy projects directory
        legacy_project_dir = os.path.join("projects", project_id)

        # Check for different types of trained models
        basic_model_files = [
            os.path.join(project_dir, "chatbot_model.pth"),
            os.path.join(project_dir, "data.pth"),
            os.path.join(legacy_project_dir, "chatbot_model.pth"),
            os.path.join(legacy_project_dir, "data.pth")
        ]

        advanced_model_file = os.path.join(project_dir, "advanced_model.pth")
        legacy_advanced_model_file = os.path.join(legacy_project_dir, "advanced_model.pth")

        # Check for transformer models
        transformer_dirs = [
            os.path.join(project_dir, "transformer_model_basic"),
            os.path.join(project_dir, "transformer_model_medium"),
            os.path.join(project_dir, "transformer_model_advanced"),
            os.path.join(legacy_project_dir, "transformer_model_basic"),
            os.path.join(legacy_project_dir, "transformer_model_medium"),
            os.path.join(legacy_project_dir, "transformer_model_advanced")
        ]
        
        # Find the project in the list
        project_index = next((i for i, p in enumerate(projects) if p["id"] == project_id), None)
        if project_index is None:
            return projects
        
        current_status = projects[project_index].get("training_status", "not_trained")
        
        # Check if any model exists
        has_basic_model = any(os.path.exists(f) for f in basic_model_files)
        has_advanced_model = os.path.exists(advanced_model_file) or os.path.exists(legacy_advanced_model_file)
        has_transformer_model = any(os.path.exists(d) and os.listdir(d) for d in transformer_dirs if os.path.exists(d))
        
        if has_transformer_model:
            # Find which transformer model exists
            for i, transformer_dir in enumerate(transformer_dirs):
                if os.path.exists(transformer_dir) and os.listdir(transformer_dir):
                    model_types = ["basic", "medium", "advanced"]
                    projects[project_index]["training_status"] = "trained"
                    projects[project_index]["model_type"] = f"transformer_{model_types[i]}"
                    logger.info(f"Updated project {project_id} status to trained (transformer_{model_types[i]})")
                    break
        elif has_advanced_model:
            projects[project_index]["training_status"] = "trained"
            projects[project_index]["model_type"] = "advanced"
            logger.info(f"Updated project {project_id} status to trained (advanced)")
        elif has_basic_model:
            projects[project_index]["training_status"] = "trained"
            projects[project_index]["model_type"] = "basic"
            logger.info(f"Updated project {project_id} status to trained (basic)")
        else:
            # No models found, ensure status is not_trained
            if current_status != "not_trained":
                projects[project_index]["training_status"] = "not_trained"
                logger.info(f"Updated project {project_id} status to not_trained (no models found)")
        
        return projects
        
    except Exception as e:
        logger.error(f"Error checking training status for project {project_id}: {e}")
        return projects