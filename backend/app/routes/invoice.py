import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app.utils.security import token_required
from app.models import db
from app.models_payment import Invoice

invoice_bp = Blueprint('invoice', __name__)

@invoice_bp.route('/invoices', methods=['POST'])
@cross_origin()
@token_required
def create_invoice(current_user):
    """Create a new invoice record"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invoice data is required"}), 400

        required_fields = ['amount', 'due_date']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Generate invoice number
        invoice_number = f"INV_{uuid.uuid4().hex[:12].upper()}"

        # Create invoice record
        invoice = Invoice(
            user_id=current_user['id'],
            subscription_id=data.get('subscription_id'),
            order_id=data.get('order_id'),
            invoice_number=invoice_number,
            amount=data['amount'],
            currency=data.get('currency', 'USD'),
            status=data.get('status', 'unpaid'),
            due_date=datetime.fromisoformat(data['due_date'])
        )

        db.session.add(invoice)
        db.session.commit()

        return jsonify({
            "success": True,
            "invoice": invoice.to_dict(),
            "message": "Invoice created successfully"
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating invoice: {e}")
        return jsonify({"error": "Failed to create invoice"}), 500

@invoice_bp.route('/invoices/<invoice_id>')
@cross_origin()
@token_required
def get_invoice(current_user, invoice_id):
    """Get a specific invoice by ID"""
    try:
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user['id']).first()

        if not invoice:
            return jsonify({"error": "Invoice not found"}), 404

        return jsonify({
            "success": True,
            "invoice": invoice.to_dict()
        })

    except Exception as e:
        print(f"Error getting invoice: {e}")
        return jsonify({"error": "Failed to retrieve invoice"}), 500

@invoice_bp.route('/invoices')
@cross_origin()
@token_required
def get_user_invoices(current_user):
    """Get all invoices for the current user"""
    try:
        invoices = Invoice.query.filter_by(user_id=current_user['id']).order_by(Invoice.created_at.desc()).all()

        return jsonify({
            "success": True,
            "invoices": [invoice.to_dict() for invoice in invoices]
        })

    except Exception as e:
        print(f"Error getting user invoices: {e}")
        return jsonify({"error": "Failed to retrieve invoices"}), 500

@invoice_bp.route('/invoices/<invoice_id>/pay', methods=['POST'])
@cross_origin()
@token_required
def pay_invoice(current_user, invoice_id):
    """Mark an invoice as paid"""
    try:
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user['id']).first()

        if not invoice:
            return jsonify({"error": "Invoice not found"}), 404

        if invoice.status == 'paid':
            return jsonify({"error": "Invoice is already paid"}), 400

        invoice.status = 'paid'
        invoice.paid_at = datetime.utcnow()
        invoice.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "invoice": invoice.to_dict(),
            "message": "Invoice marked as paid successfully"
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error paying invoice: {e}")
        return jsonify({"error": "Failed to pay invoice"}), 500

@invoice_bp.route('/invoices/<invoice_id>', methods=['PUT'])
@cross_origin()
@token_required
def update_invoice(current_user, invoice_id):
    """Update an invoice"""
    try:
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user['id']).first()

        if not invoice:
            return jsonify({"error": "Invoice not found"}), 404

        data = request.get_json()

        if 'status' in data:
            invoice.status = data['status']
        if 'amount' in data:
            invoice.amount = data['amount']
        if 'due_date' in data:
            invoice.due_date = datetime.fromisoformat(data['due_date'])

        invoice.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "invoice": invoice.to_dict(),
            "message": "Invoice updated successfully"
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error updating invoice: {e}")
        return jsonify({"error": "Failed to update invoice"}), 500
