
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

# Import the db instance from models.py to avoid circular imports
from app.models import db

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False)
    transaction_id = db.Column(db.String(100), unique=True, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(20), default='completed')  # pending, completed, failed, refunded
    payment_method = db.Column(db.String(50), default='card')  # card, paypal, etc.

    # Billing Address
    billing_street = db.Column(db.String(255))
    billing_city = db.Column(db.String(100))
    billing_state = db.Column(db.String(100))
    billing_zip_code = db.Column(db.String(20))
    billing_country = db.Column(db.String(100))

    # Card Details (encrypted in production)
    card_last_four = db.Column(db.String(4))
    card_brand = db.Column(db.String(20))  # visa, mastercard, amex, etc.

    # Paytm Details
    paytm_order_id = db.Column(db.String(100), unique=True, nullable=True)  # Paytm order ID

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='payments', lazy=True)
    project = db.relationship('Project', backref='payments', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'transaction_id': self.transaction_id,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'payment_method': self.payment_method,
            'billing_street': self.billing_street,
            'billing_city': self.billing_city,
            'billing_state': self.billing_state,
            'billing_zip_code': self.billing_zip_code,
            'billing_country': self.billing_country,
            'card_last_four': self.card_last_four,
            'card_brand': self.card_brand,
            'paytm_order_id': self.paytm_order_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)  # User who owns the subscription
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False, index=True)  # Project this subscription is for
    plan_type = db.Column(db.String(20), nullable=False, default='basic')  # basic, medium, advanced
    model_type = db.Column(db.String(20), nullable=False, default='basic')  # basic, medium, advanced
    token_id = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), nullable=False, index=True)  # For backward compatibility
    amount = db.Column(db.Float, nullable=False, default=0.0)
    currency = db.Column(db.String(3), default='INR')
    billing_cycle = db.Column(db.String(20), default='monthly')  # monthly, yearly
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    next_billing_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='active')  # active, expired, cancelled, suspended, past_due
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='subscriptions', lazy=True)
    project = db.relationship('Project', backref='subscriptions', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'plan_type': self.plan_type,
            'model_type': self.model_type,
            'token_id': self.token_id,
            'email': self.email,
            'amount': self.amount,
            'currency': self.currency,
            'billing_cycle': self.billing_cycle,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'next_billing_date': self.next_billing_date.isoformat() if self.next_billing_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)  # Remove FK constraint temporarily
    subscription_id = db.Column(db.String(36), nullable=True)  # Remove FK constraint temporarily
    order_id = db.Column(db.String(36), nullable=True)  # Remove FK constraint temporarily
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(20), default='unpaid')  # unpaid, paid, overdue, cancelled
    due_date = db.Column(db.DateTime, nullable=False)
    paid_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # user = db.relationship('User', backref='invoices', lazy=True)  # Comment out for now
    # subscription = db.relationship('Subscription', backref='invoices', lazy=True)  # Comment out for now
    # order = db.relationship('Order', backref='invoices', lazy=True)  # Comment out for now

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subscription_id': self.subscription_id,
            'order_id': self.order_id,
            'invoice_number': self.invoice_number,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)  # Remove FK constraint temporarily
    subscription_id = db.Column(db.String(36), nullable=True)  # Remove FK constraint temporarily
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, cancelled
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, paid, refunded
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # user = db.relationship('User', backref='orders', lazy=True)  # Comment out for now
    # subscription = db.relationship('Subscription', backref='orders', lazy=True)  # Comment out for now

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subscription_id': self.subscription_id,
            'order_number': self.order_number,
            'total_amount': self.total_amount,
            'currency': self.currency,
            'status': self.status,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
