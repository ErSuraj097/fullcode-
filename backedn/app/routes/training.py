import os
import json
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from functools import wraps
from app.utils.security import token_required
from app.utils.data import load_projects, save_projects
from app.models import db, Project
from app.utils.training_status_checker import check_and_update_training_status
from app.utils.adaptive_learning import get_adaptive_learner
from app.utils.training_notifications import training_notification_manager, notify_training_started, notify_training_completed, notify_training_failed
from config import PROJECTS_DIR
import os

from deep_translator import GoogleTranslator
from chatbot_model.utils.nltk_utils import tokenize, bag_of_words
from chatbot_model.utils.response_selector import response_selector
from chatbot_model.models.model import ChatbotModel
from chatbot_model.utils.train_utils import train_model
from chatbot_model.models.advanced_model import AdvancedModelTrainer, TrainingConfig

from werkzeug.utils import secure_filename
from app.utils.file_processing import process_multiple_file_formats
from chatbot_model.models.transformer_models import (
    get_available_transformer_models,
    train_transformer_model,
    predict_with_transformer,
    get_transformer_status,
    check_model_requirements
)
from app.utils.enhanced_file_processor import file_processor



training_bp = Blueprint('training', __name__)


logger = logging.getLogger(__name__)    


# Enhanced File Upload and Training Endpoint
@training_bp.route('/projects/<project_id>/upload-and-train', methods=['POST'])
@token_required
def upload_and_train_project(current_user, project_id):
    """Upload files, extract training data, and train the model"""
    try:
        projects = load_projects()
        project_index = next((i for i, p in enumerate(projects) if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        if project_index is None:
            return jsonify({"error": "Project not found"}), 404
        if 'files' not in request.files:
            return jsonify({"error": "No files uploaded"}), 400
        
        files = request.files.getlist('files')
        if not files or all(not f.filename for f in files):
            return jsonify({"error": "No valid files provided"}), 400
        
        processing_result = file_processor.process_uploaded_files(files, project_id)
        
        if not processing_result["extracted_intents"] and not processing_result["file_contents"]:
            return jsonify({
                "error": "No training data could be extracted from uploaded files",
                "details": processing_result["errors"]
            }), 400
      
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        existing_intents = {"intents": []}
        
        if os.path.exists(intents_file):
            with open(intents_file, "r", encoding="utf-8") as f:
                existing_intents = json.load(f)
        
        if processing_result["extracted_intents"]:
            existing_intents["intents"].extend(processing_result["extracted_intents"])
        
        with open(intents_file, "w", encoding="utf-8") as f:
            json.dump(existing_intents, f, ensure_ascii=False, indent=4)
        
        if processing_result["file_contents"]:
            content_file = os.path.join(PROJECTS_DIR, project_id, "uploaded_content.json")
            with open(content_file, "w", encoding="utf-8") as f:
                json.dump(processing_result["file_contents"], f, ensure_ascii=False, indent=4)
        
        projects[project_index]["training_status"] = "training"
        save_projects(projects)
        
        # Train the model
        try:
            config = TrainingConfig(
                model_type="advanced",
                epochs=50,
                learning_rate=0.001,
                confidence_threshold=0.75
            )
            
            trainer = AdvancedModelTrainer(config)
            result = trainer.train(existing_intents["intents"])
            trainer.save_model(project_id)
            
            accuracy = float(result.get("accuracy", 0)) if result.get("accuracy") is not None else 0
            
            # Update project status
            projects[project_index]["training_status"] = "trained"
            projects[project_index]["model_type"] = "advanced"
            projects[project_index]["accuracy"] = accuracy
            projects[project_index]["updated_at"] = datetime.utcnow().isoformat()
            save_projects(projects)
            
            return jsonify({
                "message": "Files processed and model trained successfully",
                "model_type": "advanced",
                "accuracy": accuracy,
                "processing_result": {
                    "processed_files": processing_result["processed_files"],
                    "total_intents": len(existing_intents["intents"]),
                    "new_intents": len(processing_result["extracted_intents"]),
                    "total_patterns": processing_result["total_patterns"],
                    "total_responses": processing_result["total_responses"],
                    "errors": processing_result["errors"]
                }
            })
            
        except Exception as training_error:
            logger.warning(f"Advanced training failed, trying basic: {str(training_error)}")
            
            # Fallback to basic training
            result = train_model(project_id)
            accuracy = float(result.get("accuracy", 0)) if result.get("accuracy") is not None else 0
            
            projects[project_index]["training_status"] = "trained"
            projects[project_index]["model_type"] = "basic"
            projects[project_index]["accuracy"] = accuracy
            projects[project_index]["updated_at"] = datetime.utcnow().isoformat()
            save_projects(projects)
            
            return jsonify({
                "message": "Files processed and basic model trained successfully",
                "model_type": "basic",
                "accuracy": accuracy,
                "processing_result": {
                    "processed_files": processing_result["processed_files"],
                    "total_intents": len(existing_intents["intents"]),
                    "new_intents": len(processing_result["extracted_intents"]),
                    "total_patterns": processing_result["total_patterns"],
                    "total_responses": processing_result["total_responses"],
                    "errors": processing_result["errors"]
                }
            })
            
    except Exception as e:
        logger.error(f"Error in upload and train: {str(e)}")
        return jsonify({"error": f"Upload and training failed: {str(e)}"}), 500

# Training Endpoint
@training_bp.route('/projects/<project_id>/train', methods=['POST'])
@token_required
def train_project(current_user, project_id):
    try:
        # Use database instead of JSON files
        from app.models import Project
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Update project status in database
        project.training_status = "training"
        db.session.commit()
        
        # Start progress tracking and notifications
        from app.utils.training_progress import training_progress_tracker
        training_progress_tracker.start_training(project_id, "advanced", estimated_time=120)
        notify_training_started(project_id, "advanced", current_user["id"])
        
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if not os.path.exists(intents_file):
            training_progress_tracker.complete_training(project_id, False, error_message="No training data found")
            return jsonify({"error": "No training data found"}), 404
        
        with open(intents_file, "r", encoding="utf-8") as f:
            intents_data = json.load(f)
        
        if not intents_data.get("intents"):
            training_progress_tracker.complete_training(project_id, False, error_message="No intents found")
            return jsonify({"error": "No intents found for training"}), 400
        
        try:
            config = TrainingConfig(
                model_type="advanced",
                epochs=50,
                learning_rate=0.001,
                confidence_threshold=0.75
            )
            
            trainer = AdvancedModelTrainer(config)
            result = trainer.train(intents_data["intents"])
            trainer.save_model(project_id)
    
            accuracy = float(result.get("accuracy", 0)) if result.get("accuracy") is not None else 0
            
            # Update project status in database
            project.training_status = "trained"
            project.config = project.config or {}
            project.config["model_type"] = "advanced"
            project.config["accuracy"] = accuracy
            project.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Complete progress tracking and notify success
            training_progress_tracker.complete_training(project_id, True, accuracy)
            notify_training_completed(project_id, "advanced", accuracy, current_user["id"])
            
            logger.info(f"Advanced model trained for project {project_id}")
            return jsonify({
                "message": "Advanced model trained successfully",
                "model_type": "advanced",
                "accuracy": accuracy
            })
            
        except Exception as advanced_error:
            logger.warning(f"Advanced training failed for project {project_id}: {str(advanced_error)}")

            result = train_model(project_id)
            
        
            accuracy = float(result.get("accuracy", 0)) if result.get("accuracy") is not None else 0
            
            # Update project status in database (fallback to basic)
            project.training_status = "trained"
            project.config = project.config or {}
            project.config["model_type"] = "basic"
            project.config["accuracy"] = accuracy
            project.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Complete progress tracking and notify success
            training_progress_tracker.complete_training(project_id, True, accuracy)
            notify_training_completed(project_id, "basic", accuracy, current_user["id"])
            
            logger.info(f"Basic model trained for project {project_id}")
            return jsonify({
                "message": "Basic model trained successfully",
                "model_type": "basic",
                "accuracy": accuracy
            })
            
    except Exception as e:

        try:
            project.training_status = "error"
            project.updated_at = datetime.utcnow()
            db.session.commit()
            # Complete progress tracking with error and notify failure
            training_progress_tracker.complete_training(project_id, False, error_message=str(e))
            notify_training_failed(project_id, str(e), current_user["id"])
        except:
            pass
        
        logger.error(f"Error training model for project {project_id}: {str(e)}")
        return jsonify({"error": f"Training failed: {str(e)}"}), 500

# New Transformer Training Endpoint
@training_bp.route('/projects/<project_id>/train-transformer', methods=['POST'])
@token_required
def train_transformer_project(current_user, project_id):
    """Train project with transformer models (basic, medium, advanced)"""
    try:
        data = request.get_json()
        model_type = data.get('model_type', 'medium')
        auto_correct_data = data.get('auto_correct_data', True)
        
        # Basic validation
        if model_type not in ['basic', 'medium', 'advanced']:
            return jsonify({"error": "Invalid model type"}), 400
        
        # Verify project ownership using direct database query
        from app.models import Project
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Update training status directly in database
        project.training_status = "training"
        project.config = project.config or {}
        project.config["selected_model"] = model_type
        db.session.commit()
        
        # Load intents
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if not os.path.exists(intents_file):
            return jsonify({"error": "No training data found"}), 404
        
        with open(intents_file, "r", encoding="utf-8") as f:
            intents_data = json.load(f)
        
        if not intents_data.get("intents"):
            return jsonify({"error": "No intents found for training"}), 400
        
        # Auto-correct data if requested
        if auto_correct_data:
            try:
                from chatbot_model.service.file_processing.enhanced_text_processor import EnhancedTextProcessor
                text_processor = EnhancedTextProcessor()
                
                corrected_intents = []
                
                for intent in intents_data["intents"]:
                    validation_result = text_processor.validate_intent_data(intent)
                    if validation_result['valid']:
                        # Use the original intent since validate_intent_data doesn't return cleaned_data
                        cleaned_intent = {
                            "tag": str(intent["tag"]).strip(),
                            "patterns": [str(p).strip() for p in intent.get("patterns", []) if str(p).strip()],
                            "responses": [str(r).strip() for r in intent.get("responses", []) if str(r).strip()]
                        }
                        corrected_intents.append(cleaned_intent)
                    else:
                        logger.warning(f"Skipping invalid intent: {intent.get('tag', 'unknown')} - {validation_result.get('issues', [])}")
                
                if corrected_intents:
                    intents_data["intents"] = corrected_intents
                    # Save corrected data
                    with open(intents_file, "w", encoding="utf-8") as f:
                        json.dump(intents_data, f, ensure_ascii=False, indent=4)
                    logger.info(f"Auto-corrected {len(corrected_intents)} intents for project {project_id}")
                else:
                    return jsonify({"error": "No valid intents found after auto-correction"}), 400
                    
            except ImportError:
                logger.warning("Enhanced text processor not available for auto-correction")
        
        # Train transformer model
        logger.info(f"Starting {model_type} transformer training for project {project_id}")
        
        training_result = train_transformer_model(
            model_type=model_type,
            intents_data=intents_data,
            project_id=project_id
        )
        
        # Update project status in database
        project.training_status = "trained"
        project.model_type = f"transformer_{model_type}"
        project.accuracy = training_result["accuracy"]
        project.config = project.config or {}
        project.config["training_time"] = training_result["training_time"]
        project.config["num_examples"] = training_result["num_examples"]
        project.config["num_intents"] = training_result["num_intents"]
        project.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Transformer {model_type} model trained successfully for project {project_id}")
        
        return jsonify({
            "message": f"Transformer {model_type} model trained successfully",
            "model_type": f"transformer_{model_type}",
            "accuracy": training_result["accuracy"],
            "training_time": training_result["training_time"],
            "num_examples": training_result["num_examples"],
            "num_intents": training_result["num_intents"],
            "auto_corrected": auto_correct_data
        })
        
    except Exception as e:
        logger.error(f"Transformer training error for project {project_id}: {str(e)}")
        
        # Update project status on error
        try:
            project.training_status = "error"
            project.updated_at = datetime.utcnow()
            db.session.commit()
        except:
            pass
        
        return jsonify({"error": f"Transformer training failed: {str(e)}"}), 500

# Advanced Training Endpoint
@training_bp.route('/projects/<project_id>/train-advanced', methods=['POST'])
@token_required
def train_project_advanced(current_user, project_id):
    """Advanced training with model selection and custom parameters"""
    try:
        data = request.get_json()
        training_options = data or {}
        
        # Verify project ownership
        projects = load_projects()
        project_index = next((i for i, p in enumerate(projects) if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        
        if project_index is None:
            return jsonify({"error": "Project not found"}), 404
        
        # Extract training options
        model_type = training_options.get("model_type", "medium")  # basic, medium, advanced
        auto_correct = training_options.get("auto_correct_data", True)
        custom_params = training_options.get("custom_parameters", {})
        
        # Validate model type
        valid_models = ["basic", "medium", "advanced"]
        if model_type not in valid_models:
            return jsonify({"error": f"Invalid model type. Must be one of: {valid_models}"}), 400
        
        # Load intents
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if not os.path.exists(intents_file):
            return jsonify({"error": "No intents found. Please add intents before training."}), 400
        
        with open(intents_file, "r", encoding="utf-8") as f:
            intents_data = json.load(f)
        
        if not intents_data.get("intents"):
            return jsonify({"error": "No intents found in the file."}), 400
        
        # Update project status
        projects[project_index]["training_status"] = "training"
        projects[project_index]["model_type"] = f"transformer_{model_type}"
        save_projects(projects)

        
        # Auto-correct data if requested
        if auto_correct:
            try:
                from chatbot_model.service.file_processing.enhanced_text_processor import EnhancedTextProcessor
                text_processor = EnhancedTextProcessor()
                for intent in intents_data["intents"]:
                    # Clean patterns
                    cleaned_patterns = []
                    for pattern in intent.get("patterns", []):
                        cleaned = text_processor.preprocess_for_training(pattern)
                        if cleaned:
                            cleaned_patterns.append(cleaned)
                    intent["patterns"] = cleaned_patterns
                    
                    # Clean responses
                    cleaned_responses = []
                    for response in intent.get("responses", []):
                        cleaned = text_processor.preprocess_for_training(response)
                        if cleaned:
                            cleaned_responses.append(cleaned)
                    intent["responses"] = cleaned_responses
                
                # Save cleaned data
                with open(intents_file, "w", encoding="utf-8") as f:
                    json.dump(intents_data, f, indent=2, ensure_ascii=False)
                    
            except ImportError:
                logger.warning("Enhanced text processor not available for auto-correction")
        
        # Train with transformer model
        logger.info(f"Starting advanced {model_type} transformer training for project {project_id}")
        
        training_result = train_transformer_model(
            model_type=model_type,
            intents_data=intents_data,
            project_id=project_id
        )
        
        # Update project with results
        projects[project_index]["training_status"] = "trained"
        projects[project_index]["model_type"] = f"transformer_{model_type}"
        projects[project_index]["accuracy"] = training_result.get("accuracy", 0)
        projects[project_index]["training_time"] = training_result.get("training_time", 0)
        projects[project_index]["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        save_projects(projects)
        
        logger.info(f"Advanced {model_type} model trained successfully for project {project_id}")
        
        return jsonify({
            "message": f"Advanced {model_type} model trained successfully",
            "model_type": f"transformer_{model_type}",
            "training_options": training_options,
            "accuracy": training_result.get("accuracy", 0),
            "training_time": training_result.get("training_time", 0),
            "num_examples": training_result.get("num_examples", 0),
            "num_intents": training_result.get("num_intents", 0),
            "training_result": training_result
        })
        
    except Exception as e:
        logger.error(f"Advanced training error for project {project_id}: {str(e)}")
        
        # Update project status on error
        try:
            projects = load_projects()
            project_index = next((i for i, p in enumerate(projects) if p["id"] == project_id), None)
            if project_index is not None:
                projects[project_index]["training_status"] = "error"
                save_projects(projects)
        except Exception:
            pass
        
        return jsonify({"error": f"Advanced training failed: {str(e)}"}), 500

# Training Status Endpoint
@training_bp.route('/projects/<project_id>/training/status')
@token_required
def get_training_status(current_user, project_id):
    """Get real-time training status for a project"""
    try:
        # Verify project ownership
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Get real-time progress from progress tracker
        from app.utils.training_progress import training_progress_tracker
        progress_data = training_progress_tracker.get_progress(project_id)
        
        # Check and update training status based on actual model files
        projects = check_and_update_training_status(project_id, projects)
        save_projects(projects)
        
        # Get updated project data
        project = next((p for p in projects if p["id"] == project_id), None)
        
        training_status = {
            "project_id": project_id,
            "status": project.get("training_status", "not_trained"),
            "model_type": project.get("model_type", "basic"),
            "accuracy": project.get("accuracy", 0),
            "training_time": project.get("training_time", 0),
            "progress": 100 if project.get("training_status") == "trained" else 0,
            "estimated_time_remaining": 0,
            "current_epoch": 0,
            "total_epochs": 0,
            "last_updated": project.get("updated_at"),
            "error_message": None,
            "is_training": project.get("training_status") in ["training", "auto_training"]
        }
        
        # Use progress data if available
        if progress_data:
            training_status.update({
                "progress": progress_data.get("progress", 0),
                "current_epoch": progress_data.get("current_epoch", 0),
                "total_epochs": progress_data.get("total_epochs", 0),
                "current_loss": progress_data.get("current_loss"),
                "best_accuracy": progress_data.get("best_accuracy", 0),
                "message": progress_data.get("message", ""),
                "estimated_completion": progress_data.get("estimated_completion")
            })
            
            # Calculate estimated time remaining
            if progress_data.get("estimated_completion"):
                try:
                    completion_time = datetime.fromisoformat(progress_data["estimated_completion"])
                    remaining_seconds = max(0, (completion_time - datetime.utcnow()).total_seconds())
                    training_status["estimated_time_remaining"] = int(remaining_seconds)
                except:
                    pass
        
        # Add more detailed status based on training status
        elif project.get("training_status") in ["training", "auto_training"]:
            training_status.update({
                "progress": 25,  # Default progress
                "estimated_time_remaining": 180,  # 3 minutes default
                "message": "Training in progress..."
            })
        elif project.get("training_status") == "error":
            training_status["error_message"] = "Training failed. Please check your intents data and try again."
        
        return jsonify(training_status)
        
    except Exception as e:
        logger.error(f"Error getting training status: {e}")
        return jsonify({"error": "Failed to get training status"}), 500

# Training Notifications Endpoint
@training_bp.route('/projects/<project_id>/training/notifications')
@token_required
def get_training_notifications(current_user, project_id):
    """Get training notifications for a project"""
    try:
        # Verify project ownership
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        notifications = training_notification_manager.get_notifications(
            user_id=current_user["id"], 
            project_id=project_id
        )
        
        return jsonify({
            "notifications": notifications,
            "total": len(notifications),
            "unread": len([n for n in notifications if not n.get("read", False)])
        })
        
    except Exception as e:
        logger.error(f"Error getting training notifications: {e}")
        return jsonify({"error": "Failed to get notifications"}), 500

@training_bp.route('/training/notifications/mark-read', methods=['POST'])
@token_required
def mark_notifications_read(current_user):
    """Mark training notifications as read"""
    try:
        data = request.get_json()
        notification_id = data.get('notification_id')
        project_id = data.get('project_id')
        
        if notification_id:
            success = training_notification_manager.mark_as_read(notification_id)
            return jsonify({"success": success})
        elif project_id:
            count = training_notification_manager.mark_all_as_read(
                user_id=current_user["id"], 
                project_id=project_id
            )
            return jsonify({"marked_count": count})
        else:
            return jsonify({"error": "notification_id or project_id required"}), 400
            
    except Exception as e:
        logger.error(f"Error marking notifications as read: {e}")
        return jsonify({"error": "Failed to mark notifications"}), 500

# Adaptive Learning Endpoint
@training_bp.route('/projects/<project_id>/adaptive-learning', methods=['POST'])
@token_required
def trigger_adaptive_learning(current_user, project_id):
    """Manually trigger adaptive learning from accumulated feedback"""
    try:
        # Verify project ownership
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id and p["user_id"] == current_user["id"]), None)

        if not project:
            return jsonify({"error": "Project not found"}), 404

        # Trigger adaptive learning
        learner = get_adaptive_learner(project_id)
        result = learner.analyze_feedback_and_update()

        return jsonify({
            "message": "Adaptive learning completed",
            "result": result
        })

    except Exception as e:
        logger.error(f"Error in adaptive learning for project {project_id}: {str(e)}")
        return jsonify({"error": f"Adaptive learning failed: {str(e)}"}), 500

# Adaptive Learning Status Endpoint
@training_bp.route('/projects/<project_id>/adaptive-learning/status')
@token_required
def get_adaptive_learning_status(current_user, project_id):
    """Get status and statistics of adaptive learning"""
    try:
        # Verify project ownership
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id and p["user_id"] == current_user["id"]), None)

        if not project:
            return jsonify({"error": "Project not found"}), 404

        # Get learning stats
        learner = get_adaptive_learner(project_id)
        stats = learner.get_learning_stats()

        return jsonify(stats)

    except Exception as e:
        logger.error(f"Error getting adaptive learning status for project {project_id}: {str(e)}")
        return jsonify({"error": f"Failed to get learning status: {str(e)}"}), 500

# Public Training Endpoints (for testing)
@training_bp.route('/public/projects/<project_id>/train', methods=['POST'])
def train_project_public(project_id):
    """Public legacy training endpoint for testing (no auth required)"""
    try:
        # Load intents
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if not os.path.exists(intents_file):
            return jsonify({"error": "No training data found"}), 404
        
        with open(intents_file, "r", encoding="utf-8") as f:
            intents_data = json.load(f)
        
        if not intents_data.get("intents"):
            return jsonify({"error": "No intents found for training"}), 400
        
        # Try advanced training first
        try:
            config = TrainingConfig(
                model_type="advanced",
                epochs=50,
                learning_rate=0.001,
                confidence_threshold=0.75
            )
            
            trainer = AdvancedModelTrainer(config)
            result = trainer.train(intents_data["intents"])
            trainer.save_model(project_id)
            
            # Convert numpy types to Python native types for JSON serialization
            accuracy = float(result.get("accuracy", 0)) if result.get("accuracy") is not None else 0
            
            logger.info(f"Public advanced model trained for project {project_id}")
            return jsonify({
                "message": "Advanced model trained successfully",
                "model_type": "advanced",
                "accuracy": accuracy
            })
            
        except Exception as advanced_error:
            logger.warning(f"Advanced training failed for project {project_id}: {str(advanced_error)}")
            # Fallback to basic training
            result = train_model(project_id)
            
            # Convert numpy types to Python native types for JSON serialization
            accuracy = float(result.get("accuracy", 0)) if result.get("accuracy") is not None else 0
            
            logger.info(f"Public basic model trained for project {project_id}")
            return jsonify({
                "message": "Basic model trained successfully",
                "model_type": "basic",
                "accuracy": accuracy
            })
            
    except Exception as e:
        logger.error(f"Error in public training for project {project_id}: {str(e)}")
        return jsonify({"error": f"Training failed: {str(e)}"}), 500



@training_bp.route('/public/projects/<project_id>/train-transformer', methods=['POST'])
def train_transformer_project_public(project_id):
    """Public transformer training endpoint for testing (no auth required)"""
    try:
        data = request.get_json()
        model_type = data.get('model_type', 'medium')
        auto_correct_data = data.get('auto_correct_data', True)
        
        # Load intents
        intents_file = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        if not os.path.exists(intents_file):
            return jsonify({"error": "No training data found"}), 404
        
        with open(intents_file, "r", encoding="utf-8") as f:
            intents_data = json.load(f)
        
        if not intents_data.get("intents"):
            return jsonify({"error": "No intents found for training"}), 400
        
        # Train transformer model
        logger.info(f"Starting public {model_type} transformer training for project {project_id}")
        
        training_result = train_transformer_model(
            model_type=model_type,
            intents_data=intents_data,
            project_id=project_id
        )
        
        logger.info(f"Public transformer {model_type} model trained successfully for project {project_id}")
        
        return jsonify({
            "message": f"Transformer {model_type} model trained successfully",
            "model_type": f"transformer_{model_type}",
            "accuracy": training_result["accuracy"],
            "training_time": training_result["training_time"],
            "num_examples": training_result["num_examples"],
            "num_intents": training_result["num_intents"],
            "auto_corrected": auto_correct_data
        })
        
    except Exception as e:
        logger.error(f"Public transformer training error for project {project_id}: {str(e)}")
        return jsonify({"error": f"Transformer training failed: {str(e)}"}), 500


