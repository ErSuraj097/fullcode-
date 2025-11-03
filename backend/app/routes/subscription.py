import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app.utils.security import token_required
from app.models import db
from app.models_payment import Subscription

subscription_bp = Blueprint('subscription', __name__)

@subscription_bp.route('/subscriptions', methods=['POST'])
@cross_origin()
@token_required
def create_subscription(current_user):
    """Create a new subscription record"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Subscription data is required"}), 400

        required_fields = ['project_id', 'plan_type', 'model_type', 'token_id', 'start_date', 'end_date', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Check if project exists and belongs to current user
        from app.models import Project
        project = Project.query.filter_by(id=data['project_id'], user_id=current_user['id']).first()
        if not project:
            return jsonify({"error": "Project not found or access denied"}), 404

        # Check if subscription already exists for this project
        existing_subscription = Subscription.query.filter_by(
            project_id=data['project_id'],
            status='active'
        ).first()
        if existing_subscription:
            return jsonify({"error": "Active subscription already exists for this project"}), 400

        # Create subscription record
        subscription = Subscription(
            user_id=current_user['id'],
            project_id=data['project_id'],
            plan_type=data['plan_type'],
            model_type=data['model_type'],
            token_id=data['token_id'],
            email=current_user['email'],
            amount=data['amount'],
            currency=data.get('currency', 'INR'),
            billing_cycle=data.get('billing_cycle', 'monthly'),
            start_date=datetime.fromisoformat(data['start_date']),
            end_date=datetime.fromisoformat(data['end_date']),
            next_billing_date=datetime.fromisoformat(data['end_date']) if data.get('billing_cycle') == 'monthly' else None,
            status=data.get('status', 'active')
        )

        db.session.add(subscription)
        db.session.commit()

        return jsonify({
            "success": True,
            "subscription": subscription.to_dict(),
            "message": "Subscription created successfully"
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating subscription: {e}")
        return jsonify({"error": "Failed to create subscription"}), 500

@subscription_bp.route('/subscriptions/<subscription_id>')
@cross_origin()
@token_required
def get_subscription(current_user, subscription_id):
    """Get a specific subscription by ID"""
    try:
        subscription = Subscription.query.filter_by(id=subscription_id).first()

        if not subscription:
            return jsonify({"error": "Subscription not found"}), 404

        return jsonify({
            "success": True,
            "subscription": subscription.to_dict()
        })

    except Exception as e:
        print(f"Error getting subscription: {e}")
        return jsonify({"error": "Failed to retrieve subscription"}), 500

@subscription_bp.route('/subscriptions')
@cross_origin()
@token_required
def get_user_subscriptions(current_user):
    """Get all subscriptions for the current user"""
    try:
        subscriptions = Subscription.query.filter_by(user_id=current_user['id']).order_by(Subscription.created_at.desc()).all()

        # Include project information in the response
        subscriptions_with_projects = []
        for subscription in subscriptions:
            sub_dict = subscription.to_dict()
            # Add project name if available
            if subscription.project:
                sub_dict['project_name'] = subscription.project.name
                sub_dict['project_type'] = subscription.project.type
            subscriptions_with_projects.append(sub_dict)

        return jsonify({
            "success": True,
            "subscriptions": subscriptions_with_projects
        })

    except Exception as e:
        print(f"Error getting user subscriptions: {e}")
        return jsonify({"error": "Failed to retrieve subscriptions"}), 500

@subscription_bp.route('/projects/<project_id>/subscription')
@cross_origin()
@token_required
def get_project_subscription(current_user, project_id):
    """Get subscription for a specific project"""
    try:
        # Check if project belongs to current user
        from app.models import Project
        project = Project.query.filter_by(id=project_id, user_id=current_user['id']).first()
        if not project:
            return jsonify({"error": "Project not found or access denied"}), 404

        subscription = Subscription.query.filter_by(
            project_id=project_id,
            user_id=current_user['id']
        ).order_by(Subscription.created_at.desc()).first()

        if not subscription:
            return jsonify({
                "success": True,
                "subscription": None,
                "message": "No subscription found for this project"
            })

        sub_dict = subscription.to_dict()
        sub_dict['project_name'] = project.name
        sub_dict['project_type'] = project.type

        return jsonify({
            "success": True,
            "subscription": sub_dict
        })

    except Exception as e:
        print(f"Error getting project subscription: {e}")
        return jsonify({"error": "Failed to retrieve subscription"}), 500

@subscription_bp.route('/subscriptions/<subscription_id>', methods=['PUT'])
@cross_origin()
@token_required
def update_subscription(current_user, subscription_id):
    """Update a subscription"""
    try:
        subscription = Subscription.query.filter_by(id=subscription_id).first()

        if not subscription:
            return jsonify({"error": "Subscription not found"}), 404

        # Check if subscription belongs to current user
        if subscription.user_id != current_user['id']:
            return jsonify({"error": "Access denied"}), 403

        data = request.get_json()

        # Update allowed fields
        if 'status' in data:
            subscription.status = data['status']
        if 'end_date' in data:
            subscription.end_date = datetime.fromisoformat(data['end_date'])
        if 'next_billing_date' in data and data['next_billing_date']:
            subscription.next_billing_date = datetime.fromisoformat(data['next_billing_date'])
        if 'plan_type' in data:
            subscription.plan_type = data['plan_type']
        if 'model_type' in data:
            subscription.model_type = data['model_type']

        subscription.updated_at = datetime.utcnow()

        db.session.commit()

        sub_dict = subscription.to_dict()
        if subscription.project:
            sub_dict['project_name'] = subscription.project.name
            sub_dict['project_type'] = subscription.project.type

        return jsonify({
            "success": True,
            "subscription": sub_dict,
            "message": "Subscription updated successfully"
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error updating subscription: {e}")
        return jsonify({"error": "Failed to update subscription"}), 500

@subscription_bp.route('/subscriptions/<subscription_id>', methods=['DELETE'])
@cross_origin()
@token_required
def delete_subscription(current_user, subscription_id):
    """Cancel/delete a subscription"""
    try:
        subscription = Subscription.query.filter_by(id=subscription_id).first()

        if not subscription:
            return jsonify({"error": "Subscription not found"}), 404

        # Check if subscription belongs to current user
        if subscription.user_id != current_user['id']:
            return jsonify({"error": "Access denied"}), 403

        # Instead of deleting, mark as cancelled
        subscription.status = 'cancelled'
        subscription.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Subscription cancelled successfully"
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling subscription: {e}")
        return jsonify({"error": "Failed to cancel subscription"}), 500

@subscription_bp.route('/projects/<project_id>/cancel-subscription', methods=['POST'])
@cross_origin()
@token_required
def cancel_project_subscription(current_user, project_id):
    """Cancel subscription for a specific project"""
    try:
        # Check if project belongs to current user
        from app.models import Project
        project = Project.query.filter_by(id=project_id, user_id=current_user['id']).first()
        if not project:
            return jsonify({"error": "Project not found or access denied"}), 404

        subscription = Subscription.query.filter_by(
            project_id=project_id,
            user_id=current_user['id'],
            status='active'
        ).first()

        if not subscription:
            return jsonify({"error": "No active subscription found for this project"}), 404

        # Mark as cancelled
        subscription.status = 'cancelled'
        subscription.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Subscription cancelled successfully"
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling project subscription: {e}")
        return jsonify({"error": "Failed to cancel subscription"}), 500
