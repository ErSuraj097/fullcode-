import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app.utils.security import token_required
from app.models import db
from app.models_payment import Order

order_bp = Blueprint('order', __name__)

@order_bp.route('/orders', methods=['POST'])
@cross_origin()
@token_required
def create_order(current_user):
    """Create a new order record"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Order data is required"}), 400

        required_fields = ['total_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Generate order number
        order_number = f"ORD_{uuid.uuid4().hex[:12].upper()}"

        # Create order record
        order = Order(
            user_id=current_user['id'],
            subscription_id=data.get('subscription_id'),
            order_number=order_number,
            total_amount=data['total_amount'],
            currency=data.get('currency', 'USD'),
            status=data.get('status', 'pending'),
            payment_status=data.get('payment_status', 'pending')
        )

        db.session.add(order)
        db.session.commit()

        return jsonify({
            "success": True,
            "order": order.to_dict(),
            "message": "Order created successfully"
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating order: {e}")
        return jsonify({"error": "Failed to create order"}), 500

@order_bp.route('/orders/<order_id>')
@cross_origin()
@token_required
def get_order(current_user, order_id):
    """Get a specific order by ID"""
    try:
        order = Order.query.filter_by(id=order_id, user_id=current_user['id']).first()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        return jsonify({
            "success": True,
            "order": order.to_dict()
        })

    except Exception as e:
        print(f"Error getting order: {e}")
        return jsonify({"error": "Failed to retrieve order"}), 500

@order_bp.route('/orders')
@cross_origin()
@token_required
def get_user_orders(current_user):
    """Get all orders for the current user"""
    try:
        orders = Order.query.filter_by(user_id=current_user['id']).order_by(Order.created_at.desc()).all()

        return jsonify({
            "success": True,
            "orders": [order.to_dict() for order in orders]
        })

    except Exception as e:
        print(f"Error getting user orders: {e}")
        return jsonify({"error": "Failed to retrieve orders"}), 500

@order_bp.route('/orders/<order_id>/status', methods=['PUT'])
@cross_origin()
@token_required
def update_order_status(current_user, order_id):
    """Update order status"""
    try:
        order = Order.query.filter_by(id=order_id, user_id=current_user['id']).first()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        data = request.get_json()

        if 'status' in data:
            order.status = data['status']
        if 'payment_status' in data:
            order.payment_status = data['payment_status']

        order.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "order": order.to_dict(),
            "message": "Order status updated successfully"
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error updating order status: {e}")
        return jsonify({"error": "Failed to update order status"}), 500

@order_bp.route('/orders/<order_id>/cancel', methods=['POST'])
@cross_origin()
@token_required
def cancel_order(current_user, order_id):
    """Cancel an order"""
    try:
        order = Order.query.filter_by(id=order_id, user_id=current_user['id']).first()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        if order.status == 'cancelled':
            return jsonify({"error": "Order is already cancelled"}), 400

        order.status = 'cancelled'
        order.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "order": order.to_dict(),
            "message": "Order cancelled successfully"
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling order: {e}")
        return jsonify({"error": "Failed to cancel order"}), 500
