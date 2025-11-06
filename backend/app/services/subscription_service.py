import uuid
from datetime import datetime, timedelta
from app.models import db, User, Project
from app.models_payment import Subscription, Invoice, Order, Payment
from config import SUBSCRIPTION_PRICING, SUBSCRIPTION_DURATION_YEARS, logger

class SubscriptionService:
    """Service for managing automatic subscription, invoice, and order creation"""

    @staticmethod
    def get_subscription_price(plan_type):
        """Get price for subscription plan"""
        return SUBSCRIPTION_PRICING.get(plan_type.lower(), SUBSCRIPTION_PRICING['basic'])

    @staticmethod
    def calculate_subscription_dates():
        """Calculate subscription start and end dates"""
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=365 * SUBSCRIPTION_DURATION_YEARS)  # 1 year
        return start_date, end_date

    @staticmethod
    def create_subscription_for_project(project_id, user_id, plan_type='basic', model_type='basic'):
        """Create subscription, invoice, and order for a new project"""
        try:
            # Get project details
            project = Project.query.get(project_id)
            if not project:
                logger.error(f"Project {project_id} not found")
                return None

            user = User.query.get(user_id)
            if not user:
                logger.error(f"User {user_id} not found")
                return None

            # Calculate dates and pricing
            start_date, end_date = SubscriptionService.calculate_subscription_dates()
            amount = SubscriptionService.get_subscription_price(plan_type)

            # Generate unique identifiers
            token_id = f"SUB_{uuid.uuid4().hex[:16].upper()}"
            order_number = f"ORD_{uuid.uuid4().hex[:12].upper()}"
            invoice_number = f"INV_{uuid.uuid4().hex[:12].upper()}"

            # Create subscription
            subscription = Subscription(
                user_id=user_id,
                project_id=project_id,
                plan_type=plan_type,
                model_type=model_type,
                token_id=token_id,
                email=user.email,
                amount=amount,
                currency='INR',
                billing_cycle='yearly',
                start_date=start_date,
                end_date=end_date,
                status='pending'  # Will be updated when payment succeeds
            )

            # Create order
            order = Order(
                user_id=user_id,
                subscription_id=None,  # Will be set after subscription is saved
                order_number=order_number,
                total_amount=amount,
                currency='INR',
                status='pending',
                payment_status='pending'
            )

            # Create invoice
            invoice = Invoice(
                user_id=user_id,
                subscription_id=None,  # Will be set after subscription is saved
                order_id=None,  # Will be set after order is saved
                invoice_number=invoice_number,
                amount=amount,
                currency='INR',
                status='unpaid',
                due_date=end_date
            )

            # Save to database
            db.session.add(subscription)
            db.session.flush()  # Get subscription ID

            order.subscription_id = subscription.id
            invoice.subscription_id = subscription.id

            db.session.add(order)
            db.session.flush()  # Get order ID

            invoice.order_id = order.id
            db.session.add(invoice)

            db.session.commit()

            logger.info(f"Created subscription {subscription.id}, order {order.id}, invoice {invoice.id} for project {project_id}")

            return {
                'subscription': subscription,
                'order': order,
                'invoice': invoice
            }

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating subscription for project {project_id}: {e}")
            return None

    @staticmethod
    def update_records_on_payment_success(payment_id):
        """Update subscription, invoice, and order when payment succeeds"""
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                logger.error(f"Payment {payment_id} not found")
                return False

            # Find related subscription
            subscription = Subscription.query.filter_by(
                project_id=payment.project_id,
                user_id=payment.user_id
            ).first()

            if not subscription:
                logger.error(f"No subscription found for payment {payment_id}")
                return False

            # Update subscription
            subscription.status = 'active'
            subscription.updated_at = datetime.utcnow()

            # Find related order
            order = Order.query.filter_by(
                subscription_id=subscription.id,
                user_id=payment.user_id
            ).first()

            if order:
                order.status = 'completed'
                order.payment_status = 'success'
                order.updated_at = datetime.utcnow()

            # Find related invoice
            invoice = Invoice.query.filter_by(
                subscription_id=subscription.id,
                user_id=payment.user_id
            ).first()

            if invoice:
                invoice.status = 'paid'
                invoice.paid_at = datetime.utcnow()
                invoice.updated_at = datetime.utcnow()

            # Update project payment status
            project = Project.query.get(payment.project_id)
            if project:
                project.payment_status = 'success'
                project.updated_at = datetime.utcnow()

            db.session.commit()

            logger.info(f"Updated records for successful payment {payment_id}")
            return True

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating records on payment success {payment_id}: {e}")
            return False

    @staticmethod
    def update_records_on_payment_failure(payment_id):
        """Update subscription, invoice, and order when payment fails"""
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                logger.error(f"Payment {payment_id} not found")
                return False

            # Find related subscription
            subscription = Subscription.query.filter_by(
                project_id=payment.project_id,
                user_id=payment.user_id
            ).first()

            if not subscription:
                logger.error(f"No subscription found for payment {payment_id}")
                return False

            # Update subscription
            subscription.status = 'expired'
            subscription.updated_at = datetime.utcnow()

            # Find related order
            order = Order.query.filter_by(
                subscription_id=subscription.id,
                user_id=payment.user_id
            ).first()

            if order:
                order.status = 'cancelled'
                order.payment_status = 'failed'
                order.updated_at = datetime.utcnow()

            # Find related invoice
            invoice = Invoice.query.filter_by(
                subscription_id=subscription.id,
                user_id=payment.user_id
            ).first()

            if invoice:
                invoice.status = 'overdue'
                invoice.updated_at = datetime.utcnow()

            # Update project payment status
            project = Project.query.get(payment.project_id)
            if project:
                project.payment_status = 'failed'
                project.updated_at = datetime.utcnow()

            db.session.commit()

            logger.info(f"Updated records for failed payment {payment_id}")
            return True

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating records on payment failure {payment_id}: {e}")
            return False

    @staticmethod
    def update_records_on_payment_pending(payment_id):
        """Update subscription, invoice, and order when payment is pending"""
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                logger.error(f"Payment {payment_id} not found")
                return False

            # Find related subscription
            subscription = Subscription.query.filter_by(
                project_id=payment.project_id,
                user_id=payment.user_id
            ).first()

            if not subscription:
                logger.error(f"No subscription found for payment {payment_id}")
                return False

            # Update subscription
            subscription.status = 'pending'
            subscription.updated_at = datetime.utcnow()

            # Find related order
            order = Order.query.filter_by(
                subscription_id=subscription.id,
                user_id=payment.user_id
            ).first()

            if order:
                order.status = 'pending'
                order.payment_status = 'pending'
                order.updated_at = datetime.utcnow()

            # Find related invoice
            invoice = Invoice.query.filter_by(
                subscription_id=subscription.id,
                user_id=payment.user_id
            ).first()

            if invoice:
                invoice.status = 'unpaid'
                invoice.updated_at = datetime.utcnow()

            # Update project payment status
            project = Project.query.get(payment.project_id)
            if project:
                project.payment_status = 'pending'
                project.updated_at = datetime.utcnow()

            db.session.commit()

            logger.info(f"Updated records for pending payment {payment_id}")
            return True

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating records on payment pending {payment_id}: {e}")
            return False

    @staticmethod
    def get_project_subscription_data(user_id):
        """Get comprehensive subscription data for all user projects"""
        try:
            # Get all projects for user
            projects = Project.query.filter_by(user_id=user_id).all()

            result = []
            for project in projects:
                project_data = project.to_dict()

                # Get subscription
                subscription = Subscription.query.filter_by(
                    project_id=project.id,
                    user_id=user_id
                ).first()

                # Get order
                order = None
                if subscription:
                    order = Order.query.filter_by(
                        subscription_id=subscription.id,
                        user_id=user_id
                    ).first()

                # Get invoice
                invoice = None
                if subscription:
                    invoice = Invoice.query.filter_by(
                        subscription_id=subscription.id,
                        user_id=user_id
                    ).first()

                # Get payment
                payment = Payment.query.filter_by(
                    project_id=project.id,
                    user_id=user_id
                ).order_by(Payment.created_at.desc()).first()

                # Calculate duration
                duration = None
                if subscription and subscription.start_date and subscription.end_date:
                    start_date = subscription.start_date
                    end_date = subscription.end_date
                    duration_days = (end_date - start_date).days
                    duration = f"{duration_days} days"

                # Add related data
                project_data['subscription'] = subscription.to_dict() if subscription else None
                project_data['order'] = order.to_dict() if order else None
                project_data['invoice'] = invoice.to_dict() if invoice else None
                project_data['payment'] = payment.to_dict() if payment else None
                project_data['duration'] = duration

                result.append(project_data)

            return result

        except Exception as e:
            logger.error(f"Error getting project subscription data for user {user_id}: {e}")
            return []
