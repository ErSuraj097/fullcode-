import os
import json
import uuid
import shutil
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app.utils.security import token_required
from app.utils.data import get_projects_by_user, get_project_by_id, create_project as create_project_db, update_project as update_project_db, delete_project as delete_project_db
from app.utils.training_status_checker import check_and_update_training_status
from app.utils.feedback_storage import get_feedback_storage
from app.utils.adaptive_learning import get_adaptive_learner
from app.models import db, User, Project
from app.models_payment import Subscription, Invoice, Order, Payment
from app.services.subscription_service import SubscriptionService

from config import PROJECTS_DIR
from config import logger
project_bp = Blueprint('project', __name__)
from app.utils.default_chatbot import get_default_chatbot_config

@project_bp.route('/projects')
@cross_origin()
@token_required
def get_projects(current_user):
    try:
        # Get projects from database
        projects = Project.query.filter_by(user_id=current_user["id"]).order_by(Project.created_at.desc()).all()
        
        projects_data = []
        for project in projects:
            project_data = project.to_dict()
            
            # Update training status
            check_and_update_training_status(project.id, [project_data])
            
            projects_data.append(project_data)
        
        logger.info(f"Retrieved {len(projects_data)} projects for user {current_user['id']}")
        return jsonify({
            'success': True,
            'projects': projects_data
        })
    except Exception as e:
        logger.error(f"Error getting projects: {e}")
        return jsonify({"success": False, "error": "Failed to retrieve projects"}), 500

@project_bp.route('/projects/<project_id>')
@token_required
def get_project(current_user, project_id):
    try:
        project = get_project_by_id(project_id)
        
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
        
        # Update training status
        check_and_update_training_status(project_id, [project])
        
        return jsonify(project)
    except Exception as e:
        logger.error(f"Error getting project: {e}")
        return jsonify({"error": "Failed to retrieve project"}), 500


@project_bp.route('/projects', methods=['POST'])
@token_required
def create_project(current_user):
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({"error": "Project name is required"}), 400
        
        project_id = str(uuid.uuid4())
        project_data = {
            "id": project_id,
            "name": data['name'],
            "type": data.get('type', 'general'),
            "description": data.get('description', ''),
            "user_id": current_user["id"],
            "status": "draft",
            "training_status": "not_trained",
            "config": get_default_chatbot_config()
        }
        
        # Create project in database
        created_project = create_project_db(project_data)
        if not created_project:
            return jsonify({"error": "Failed to create project"}), 500

        # Create project directory and intents file
        project_dir = os.path.join(PROJECTS_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)
        intents_file = os.path.join(project_dir, "intents.json")
        with open(intents_file, "w", encoding="utf-8") as f:
            json.dump({"intents": []}, f, ensure_ascii=False, indent=4)

        # Automatically create subscription, invoice, and order for the new project
        plan_type = data.get('model_type', 'basic')  # Use model_type as plan_type
        subscription_result = SubscriptionService.create_subscription_for_project(
            project_id=project_id,
            user_id=current_user["id"],
            plan_type=plan_type,
            model_type=plan_type
        )

        if subscription_result:
            logger.info(f"Created subscription, invoice, and order for project {project_id}")
        else:
            logger.warning(f"Failed to create subscription records for project {project_id}")

        logger.info(f"Created project {project_id} for user {current_user['id']}")
        return jsonify(created_project), 201
        
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        return jsonify({"error": "Failed to create project"}), 500

@project_bp.route('/projects/<project_id>', methods=['PUT'])
@token_required
def update_project(current_user, project_id):
    try:
        data = request.get_json()
        
        # Check if project exists and belongs to user
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
        
        # Prepare update data
        update_data = {}
        if data.get('name') is not None:
            update_data["name"] = data['name']
        if data.get('type') is not None:
            update_data["type"] = data['type']
        if data.get('description') is not None:
            update_data["description"] = data['description']
        
        # Update project in database
        updated_project = update_project_db(project_id, update_data)
        if not updated_project:
            return jsonify({"error": "Failed to update project"}), 500
        
        logger.info(f"Updated project {project_id}")
        return jsonify(updated_project)
    except Exception as e:
        logger.error(f"Error updating project: {e}")
        return jsonify({"error": "Failed to update project"}), 500

@project_bp.route('/projects/<project_id>', methods=['DELETE'])
@token_required
def delete_project(current_user, project_id):
    try:
        # Check if project exists and belongs to user
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404
        
        # Delete project from database
        success = delete_project_db(project_id)
        if not success:
            return jsonify({"error": "Failed to delete project"}), 500
        
        # Remove project directory
        project_dir = os.path.join(PROJECTS_DIR, project_id)
        if os.path.exists(project_dir):
            shutil.rmtree(project_dir)
        
        logger.info(f"Deleted project {project_id}")
        return jsonify({"message": "Project deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting project: {e}")
        return jsonify({"error": "Failed to delete project"}), 500

# New endpoint for adaptive learning trigger
@project_bp.route('/projects/<project_id>/adaptive-learning', methods=['POST'])
@token_required
def adaptive_learning(current_user, project_id):
    try:
        project = get_project_by_id(project_id)
        if not project or project["user_id"] != current_user["id"]:
            return jsonify({"error": "Project not found"}), 404

        learner = get_adaptive_learner(project_id)
        result = learner.analyze_feedback_and_update()

        if result.get("retraining_triggered"):
            update_project_db(project_id, {"needs_retraining": True})

        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in adaptive learning endpoint: {e}")
        return jsonify({"error": "Adaptive learning failed"}), 500

# New endpoint for feedback submission
@project_bp.route('/projects/<project_id>/feedback', methods=['POST'])
def submit_feedback(project_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No feedback data provided"}), 400

        project = get_project_by_id(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404

        feedback_storage = get_feedback_storage(project_id)
        success = feedback_storage.store_feedback(data)

        if success:
            return jsonify({"message": "Feedback submitted successfully"})
        else:
            return jsonify({"error": "Failed to store feedback"}), 500

    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        return jsonify({"error": "Failed to submit feedback"}), 500

@project_bp.route('/projects/paid')
@cross_origin()
@token_required
def get_paid_projects(current_user):
    """Get all paid projects for the current user with related order, subscription, and invoice data"""
    try:
        # Get paid projects
        paid_projects = Project.query.filter_by(
            user_id=current_user['id'],
            payment_status='paid'
        ).order_by(Project.created_at.desc()).all()

        paid_projects_data = []
        for project in paid_projects:
            project_data = project.to_dict()

            # Get subscription for this project
            subscription = Subscription.query.filter_by(
                project_id=project.id,
                user_id=current_user['id']
            ).first()

            # Get order for this project (through subscription or payment)
            order = None
            if subscription and subscription.id:
                order = Order.query.filter_by(
                    subscription_id=subscription.id,
                    user_id=current_user['id']
                ).first()

            # If no order through subscription, try to find through payment
            if not order:
                payment = Payment.query.filter_by(
                    project_id=project.id,
                    user_id=current_user['id'],
                    status='completed'
                ).first()
                if payment:
                    order = Order.query.filter_by(
                        user_id=current_user['id']
                    ).order_by(Order.created_at.desc()).first()  # Get latest order as fallback

            # Get invoice for this project
            invoice = None
            if subscription and subscription.id:
                invoice = Invoice.query.filter_by(
                    subscription_id=subscription.id,
                    user_id=current_user['id']
                ).first()
            elif order and order.id:
                invoice = Invoice.query.filter_by(
                    order_id=order.id,
                    user_id=current_user['id']
                ).first()

            # Calculate project duration
            duration = None
            if subscription and subscription.start_date and subscription.end_date:
                start_date = subscription.start_date
                end_date = subscription.end_date
                duration_days = (end_date - start_date).days
                duration = f"{duration_days} days"

            # Add related data to project
            project_data['order_id'] = order.order_number if order else None
            project_data['subscription'] = subscription.to_dict() if subscription else None
            project_data['invoice'] = invoice.to_dict() if invoice else None
            project_data['duration'] = duration

            paid_projects_data.append(project_data)

        logger.info(f"Retrieved {len(paid_projects_data)} paid projects for user {current_user['id']}")
        return jsonify({
            'success': True,
            'paid_projects': paid_projects_data
        })

    except Exception as e:
        logger.error(f"Error getting paid projects: {e}")
        return jsonify({"success": False, "error": "Failed to retrieve paid projects"}), 500


