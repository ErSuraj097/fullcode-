import uuid
import os
from datetime import datetime
from flask import Blueprint, request, jsonify, redirect, url_for
from flask_cors import cross_origin
from app.utils.security import token_required
from app.utils.email_service import EmailService
from app.models import db, User
from app.models_payment import Payment
from app.services.subscription_service import SubscriptionService
import paytmchecksum
from config import PAYTM_MID, PAYTM_KEY, PAYTM_ENVIRONMENT, PAYTM_WEBSITE, PAYTM_CALLBACK_URL, FRONTEND_URL, SMTP_SERVER, SMTP_PORT, EMAIL_USER

payment_bp = Blueprint('payment', __name__)

def send_payment_notification(payment, user=None):
    """Send email notification based on payment status"""
    try:
        if not user:
            user = User.query.get(payment.user_id)
        
        if not user or not user.email:
            print(f"No user or email found for payment {payment.id}")
            return False
        
        payment_data = payment.to_dict()
        print(f"Sending {payment.status} email notification to {user.email}")
        
        if payment.status == 'success':
            result = EmailService.send_payment_success_email(
                user.email,
                user.name,
                payment_data
            )
            print(f"Success email result: {result}")
            return result
        elif payment.status == 'failed':
            result = EmailService.send_payment_failed_email(
                user.email, 
                user.name, 
                payment_data
            )
            print(f"Failed email result: {result}")
            return result
        elif payment.status == 'pending':
            result = EmailService.send_payment_pending_email(
                user.email, 
                user.name, 
                payment_data
            )
            print(f"Pending email result: {result}")
            return result
        elif payment.status == 'refunded':
            result = EmailService.send_payment_refund_email(
                user.email, 
                user.name, 
                payment_data
            )
            print(f"Refund email result: {result}")
            return result
        
        print(f"Unknown payment status: {payment.status}")
        return False
        
    except Exception as e:
        print(f"Error sending payment notification: {e}")
        import traceback
        traceback.print_exc()
        return False

@payment_bp.route('', methods=['POST'])
@cross_origin()
@token_required
def create_payment(current_user):
    """Create a new payment record"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Payment data is required"}), 400

        required_fields = ['project_id', 'amount', 'billing_address']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Generate transaction ID
        transaction_id = f"txn_{uuid.uuid4().hex[:16].upper()}"

        # Card details removed - only Paytm payments are supported

        # Create payment record
        payment = Payment(
            user_id=current_user['id'],
            project_id=data['project_id'],
            transaction_id=transaction_id,
            amount=data['amount'],
            currency=data.get('currency', 'USD'),
            status='success',
            payment_method='paytm',
            billing_street=data['billing_address'].get('street'),
            billing_city=data['billing_address'].get('city'),
            billing_state=data['billing_address'].get('state'),
            billing_zip_code=data['billing_address'].get('zipCode'),
            billing_country=data['billing_address'].get('country')
        )

        db.session.add(payment)
        db.session.commit()

        # Update project payment status to 'success'
        from app.models import Project
        project = Project.query.get(data['project_id'])
        if project:
            project.payment_status = 'success'
            project.updated_at = datetime.utcnow()
            db.session.commit()

        # Send payment success email notification
        user = User.query.get(current_user['id'])
        if user:
            send_payment_notification(payment, user)

        return jsonify({
            "success": True,
            "payment": payment.to_dict(),
            "message": "Payment processed successfully"
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating payment: {e}")
        return jsonify({"error": "Failed to process payment"}), 500

@payment_bp.route('/payments/<payment_id>')
@cross_origin()
@token_required
def get_payment(current_user, payment_id):
    """Get a specific payment by ID"""
    try:
        payment = Payment.query.filter_by(id=payment_id, user_id=current_user['id']).first()

        if not payment:
            return jsonify({"error": "Payment not found"}), 404

        return jsonify({
            "success": True,
            "payment": payment.to_dict()
        })

    except Exception as e:
        print(f"Error getting payment: {e}")
        return jsonify({"error": "Failed to retrieve payment"}), 500

@payment_bp.route('/payments')
@cross_origin()
@token_required
def get_user_payments(current_user):
    """Get all payments for the current user"""
    try:
        payments = Payment.query.filter_by(user_id=current_user['id']).order_by(Payment.created_at.desc()).all()

        return jsonify({
            "success": True,
            "payments": [payment.to_dict() for payment in payments]
        })

    except Exception as e:
        print(f"Error getting user payments: {e}")
        return jsonify({"error": "Failed to retrieve payments"}), 500

@payment_bp.route('/projects/<project_id>/payments')
@cross_origin()
@token_required
def get_project_payments(current_user, project_id):
    """Get all payments for a specific project"""
    try:
        payments = Payment.query.filter_by(
            user_id=current_user['id'],
            project_id=project_id
        ).order_by(Payment.created_at.desc()).all()

        return jsonify({
            "success": True,
            "payments": [payment.to_dict() for payment in payments]
        })

    except Exception as e:
        print(f"Error getting project payments: {e}")
        return jsonify({"error": "Failed to retrieve project payments"}), 500

@payment_bp.route('/payments/<payment_id>/refund', methods=['POST'])
@cross_origin()
@token_required
def refund_payment(current_user, payment_id):
    """Process a refund for a payment"""
    try:
        payment = Payment.query.filter_by(id=payment_id, user_id=current_user['id']).first()

        if not payment:
            return jsonify({"error": "Payment not found"}), 404

        if payment.status != 'success':
            return jsonify({"error": "Only successful payments can be refunded"}), 400

        # Update payment status
        payment.status = 'refunded'
        payment.updated_at = datetime.utcnow()

        db.session.commit()

        # Send refund email notification
        send_payment_notification(payment)

        return jsonify({
            "success": True,
            "payment": payment.to_dict(),
            "message": "Refund processed successfully"
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error processing refund: {e}")
        return jsonify({"error": "Failed to process refund"}), 500

@payment_bp.route('/initiate_paytm_payment', methods=['POST'])
@cross_origin()
@token_required
def initiate_paytm_payment(current_user):
    """Initiate a Paytm payment"""
    try:
        data = request.get_json()
        print(f"Initiating Paytm payment for user {current_user['id']}: {data}")

        if not data:
            return jsonify({"error": "Payment data is required"}), 400

        required_fields = ['project_id', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({"error": "Amount must be greater than 0"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid amount format"}), 400

        # Generate Paytm order ID
        paytm_order_id = f"ORDER_{uuid.uuid4().hex[:16].upper()}"
        print(f"Generated Paytm order ID: {paytm_order_id}")

        # Create payment record with pending status
        payment = Payment(
            user_id=current_user['id'],
            project_id=data['project_id'],
            transaction_id=paytm_order_id,  # Use Paytm order ID as transaction ID
            amount=amount,
            currency=data.get('currency', 'INR'),
            status='pending',
            payment_method='paytm',
            paytm_order_id=paytm_order_id
        )

        db.session.add(payment)
        db.session.commit()
        print(f"Payment record created with ID: {payment.id}")

        # Send payment pending email notification
        user = User.query.get(current_user['id'])
        if user:
            send_payment_notification(payment, user)

        # Paytm payment parameters
        paytm_params = {
            "MID": PAYTM_MID,
            "WEBSITE": PAYTM_WEBSITE,
            "INDUSTRY_TYPE_ID": "Retail",
            "CHANNEL_ID": "WEB",
            "ORDER_ID": paytm_order_id,
            "CUST_ID": str(current_user['id']),  # Ensure string format
            "TXN_AMOUNT": f"{amount:.2f}",  # Ensure proper decimal format
            "CALLBACK_URL": PAYTM_CALLBACK_URL,
            "EMAIL": current_user.get('email', 'customer@example.com'),
            "MOBILE_NO": "9999999999",  # Default mobile for staging
            "REQUEST_TYPE": "DEFAULT",
            "AUTH_MODE": "3D",
        }

        print(f"Paytm parameters before checksum: {paytm_params}")
        print(f"Using Paytm config - MID: {PAYTM_MID}, Environment: {PAYTM_ENVIRONMENT}")

        # Generate checksum
        checksum = paytmchecksum.generateSignature(paytm_params, PAYTM_KEY)
        paytm_params["CHECKSUMHASH"] = checksum

        # Paytm URLs
        if PAYTM_ENVIRONMENT == 'PROD':
            paytm_url = "https://securegw.paytm.in/order/process"
        else:
            paytm_url = "https://securegw-stage.paytm.in/order/process"

        print(f"Paytm URL: {paytm_url}")
        print(f"Callback URL: {PAYTM_CALLBACK_URL}")

        return jsonify({
            "success": True,
            "paytm_params": paytm_params,
            "paytm_url": paytm_url,
            "payment_id": payment.id,
            "order_id": paytm_order_id
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error initiating Paytm payment: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to initiate payment"}), 500

@payment_bp.route('/paytm_callback', methods=['POST', 'GET'])
@cross_origin()
def paytm_callback():
    """Handle Paytm payment callback"""
    try:
        # Log the incoming request
        print(f"Paytm callback received - Method: {request.method}")
        print(f"Form data: {request.form.to_dict()}")
        print(f"Args: {request.args.to_dict()}")
        
        # Handle GET requests (direct access) - redirect to failure page
        if request.method == 'GET':
            print("Direct GET access to callback URL - redirecting to failure page")
            return redirect(f"{FRONTEND_URL}/app/payment/failure?error=direct_access")

        # Get callback data from POST request
        callback_data = request.form.to_dict()

        # Validate that we have callback data
        if not callback_data or len(callback_data) == 0:
            print("No callback data received")
            return redirect(f"{FRONTEND_URL}/app/payment/failure?error=no_data")

        # Check for minimum required Paytm parameters
        required_params = ['ORDERID', 'STATUS']
        missing_params = [param for param in required_params if param not in callback_data]
        
        if missing_params:
            print(f"Missing required parameters: {missing_params}")
            return redirect(f"{FRONTEND_URL}/app/payment/failure?error=missing_params")

        # Extract order details
        order_id = callback_data.get("ORDERID")
        txn_status = callback_data.get("STATUS")
        txn_id = callback_data.get("TXNID")
        txn_amount = callback_data.get("TXNAMOUNT")
        received_checksum = callback_data.get("CHECKSUMHASH")

        print(f"Paytm callback - Order: {order_id}, Status: {txn_status}, TxnID: {txn_id}")

        # Handle checksum verification (if present)
        checksum_valid = True
        if received_checksum:
            verification_data = callback_data.copy()
            verification_data.pop("CHECKSUMHASH", None)
            checksum_valid = paytmchecksum.verifySignature(verification_data, PAYTM_KEY, received_checksum)
            
            if not checksum_valid:
                print("Invalid checksum in Paytm callback - possible fraud attempt")
                print(f"Received data: {callback_data}")
                return redirect(f"{FRONTEND_URL}/app/payment/failure?error=invalid_checksum")
        else:
            print("WARNING: No checksum received")

        # Find payment by paytm_order_id
        payment = Payment.query.filter_by(paytm_order_id=order_id).first()

        if not payment:
            print(f"Payment record not found for order ID: {order_id}")
            return redirect(f"{FRONTEND_URL}/app/payment/failure?error=payment_not_found&order_id={order_id}")

        # Update payment status based on Paytm response
        if txn_status == "TXN_SUCCESS":
            payment.status = 'success'
            payment.transaction_id = txn_id or payment.transaction_id
            print(f"Payment completed successfully for order {order_id}")

            # Update related subscription, invoice, and order records
            SubscriptionService.update_records_on_payment_success(payment.id)

        elif txn_status == "TXN_FAILURE":
            payment.status = 'failed'
            print(f"Payment failed for order {order_id}")

            # Update related subscription, invoice, and order records
            SubscriptionService.update_records_on_payment_failure(payment.id)

        else:
            payment.status = 'pending'
            print(f"Payment status unclear for order {order_id}: {txn_status}")

            # Update related subscription, invoice, and order records
            SubscriptionService.update_records_on_payment_pending(payment.id)

        payment.updated_at = datetime.utcnow()
        db.session.commit()

        # Send email notification based on payment status
        send_payment_notification(payment)

        # Redirect based on payment status
        if txn_status == "TXN_SUCCESS":
            redirect_url = f"{FRONTEND_URL}/app/payment/success?order_id={order_id}&status=success&txn_id={txn_id or ''}"
        else:
            # Include more details for failure
            failure_reason = callback_data.get("RESPMSG", "Payment failed")
            redirect_url = f"{FRONTEND_URL}/app/payment/failure?order_id={order_id}&status=failed&error=payment_failed&reason={failure_reason}"

        print(f"Redirecting to: {redirect_url}")
        
        # Create a response that works for both popup and regular redirect scenarios
        success_status = txn_status == 'TXN_SUCCESS'
        
        html_response = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment {'Success' if success_status else 'Failed'}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: {'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' if success_status else 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }}
                .container {{
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                }}
                .icon {{
                    font-size: 48px;
                    margin-bottom: 20px;
                }}
                .success {{ color: #10b981; }}
                .failed {{ color: #ef4444; }}
                h2 {{
                    margin: 0 0 16px 0;
                    color: #1f2937;
                }}
                .order-id {{
                    background: #f3f4f6;
                    padding: 12px;
                    border-radius: 8px;
                    font-family: monospace;
                    font-weight: bold;
                    margin: 16px 0;
                    word-break: break-all;
                }}
                .message {{
                    color: #6b7280;
                    margin: 16px 0;
                }}
                .loading {{
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }}
                @keyframes spin {{
                    0% {{ transform: rotate(0deg); }}
                    100% {{ transform: rotate(360deg); }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon {'success' if success_status else 'failed'}">
                    {'✅' if success_status else '❌'}
                </div>
                <h2>Payment {'Successful' if success_status else 'Failed'}</h2>
                <div class="order-id">Order ID: {order_id}</div>
                <div class="message">
                    {'Your payment has been processed successfully!' if success_status else 'Payment could not be completed. Please try again.'}
                </div>
                <div class="message">
                    <div class="loading"></div>
                    {'Redirecting to your project...' if success_status else 'Closing window...'}
                </div>
            </div>
            
            <script>
                // Try to communicate with parent window if opened as popup
                if (window.opener) {{
                    console.log('Sending message to parent window');
                    window.opener.postMessage({{
                        type: 'PAYMENT_RESULT',
                        status: '{txn_status}',
                        orderId: '{order_id}',
                        success: {str(success_status).lower()},
                        txnId: '{txn_id or ''}'
                    }}, '*');
                    
                    // Close window after a delay
                    setTimeout(function() {{
                        window.close();
                    }}, 2000);
                }} else {{
                    console.log('No parent window, redirecting');
                    // Fallback to redirect after a delay
                    setTimeout(function() {{
                        window.location.href = '{redirect_url}';
                    }}, 3000);
                }}
            </script>
        </body>
        </html>
        """
        
        return html_response

    except Exception as e:
        db.session.rollback()
        print(f"Error processing Paytm callback: {e}")
        import traceback
        traceback.print_exc()
        return redirect(f"{FRONTEND_URL}/app/payment/failure?error=server_error")

@payment_bp.route('/paytm_status/<order_id>')
@cross_origin()
def check_paytm_status(order_id):
    """Check the status of a Paytm payment by order ID"""
    try:
        # Special test case for email functionality
        if order_id == 'test_email_functionality':
            # Get the first user for testing
            user = User.query.first()
            if user:
                test_payment_data = {
                    'transaction_id': 'TEST_TXN_123',
                    'amount': 100.00,
                    'currency': 'INR',
                    'payment_method': 'test',
                    'status': 'failed'
                }
                
                print(f"Testing email to: {user.email}")
                result = EmailService.send_payment_failed_email(
                    user.email,
                    user.name or 'Test User',
                    test_payment_data
                )
                
                return jsonify({
                    "success": True,
                    "email_test_result": result,
                    "message": f"Test email {'sent' if result else 'failed'} to {user.email}",
                    "order_id": order_id
                })
            else:
                return jsonify({
                    "success": False,
                    "error": "No users found for testing",
                    "order_id": order_id
                }), 404
        
        # Payment cancellation test (workaround for 405 issue)
        if order_id.startswith('cancel_'):
            # Extract the actual order ID
            actual_order_id = order_id.replace('cancel_', '')
            
            try:
                # Find the payment by order ID
                payment = Payment.query.filter_by(paytm_order_id=actual_order_id).first()
                
                if not payment:
                    return jsonify({
                        "success": False,
                        "error": "Payment not found for cancellation",
                        "order_id": actual_order_id
                    }), 404
                
                # Update payment status to failed
                payment.status = 'failed'
                payment.updated_at = datetime.utcnow()
                db.session.commit()
                
                # Send payment failure email notification
                user = User.query.get(payment.user_id)
                if user:
                    print(f"Sending failure email to user: {user.email}")
                    email_sent = send_payment_notification(payment, user)
                    print(f"Payment failure email sent: {email_sent}")
                
                return jsonify({
                    "success": True,
                    "message": "Payment cancelled and failure notification sent",
                    "payment_status": "failed",
                    "order_id": actual_order_id,
                    "email_sent": email_sent if 'email_sent' in locals() else False
                })
                
            except Exception as e:
                db.session.rollback()
                print(f"Error cancelling payment: {e}")
                import traceback
                traceback.print_exc()
                return jsonify({
                    "success": False,
                    "error": f"Failed to cancel payment: {str(e)}",
                    "order_id": actual_order_id
                }), 500
        
        # SMTP connectivity test
        if order_id == 'test_smtp_connection':
            try:
                import smtplib
                import ssl

                print(f"Testing SMTP connection to {SMTP_SERVER}:{SMTP_PORT}")

                context = ssl.create_default_context()
                with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                    server.set_debuglevel(1)
                    print("SMTP connection established")

                    server.starttls(context=context)
                    print("TLS started successfully")

                    # Note: EMAIL_PASS is not imported, this test will fail
                    # server.login(EMAIL_USER, EMAIL_PASS)
                    print("Login skipped - EMAIL_PASS not available")

                return jsonify({
                    "success": True,
                    "message": "SMTP connection test successful (login skipped)",
                    "smtp_server": SMTP_SERVER,
                    "smtp_port": SMTP_PORT,
                    "email_user": EMAIL_USER,
                    "order_id": order_id
                })

            except Exception as e:
                print(f"SMTP connection test failed: {e}")
                import traceback
                traceback.print_exc()

                return jsonify({
                    "success": False,
                    "error": f"SMTP connection failed: {str(e)}",
                    "smtp_server": SMTP_SERVER,
                    "smtp_port": SMTP_PORT,
                    "email_user": EMAIL_USER,
                    "order_id": order_id
                })
        
        payment = Payment.query.filter_by(paytm_order_id=order_id).first()
        
        if not payment:
            return jsonify({
                "success": False,
                "error": "Payment not found",
                "order_id": order_id
            }), 404
        
        return jsonify({
            "success": True,
            "payment": payment.to_dict(),
            "order_id": order_id
        })
        
    except Exception as e:
        print(f"Error checking payment status: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Failed to check payment status"
        }), 500

@payment_bp.route('/cancel_payment/<order_id>', methods=['POST'])
@cross_origin()
@token_required
def cancel_payment(current_user, order_id):
    """Cancel a pending payment and send failure notification"""
    try:
        payment = Payment.query.filter_by(
            paytm_order_id=order_id, 
            user_id=current_user['id'],
            status='pending'
        ).first()
        
        if not payment:
            return jsonify({
                "success": False,
                "error": "Payment not found or already processed"
            }), 404
        
        # Update payment status to failed (not cancelled) to trigger failure email
        payment.status = 'failed'
        payment.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Send payment failure email notification
        user = User.query.get(current_user['id'])
        if user:
            print(f"Attempting to send failure email to user: {user.email}")
            email_sent = send_payment_notification(payment, user)
            print(f"Payment failure email sent: {email_sent}")
            if not email_sent:
                print(f"Failed to send email - checking email config and user details")
                print(f"User email: {user.email}, User name: {user.name}")
                print(f"Payment data: {payment.to_dict()}")
        else:
            print(f"User not found for ID: {current_user['id']}")
        
        return jsonify({
            "success": True,
            "message": "Payment cancelled and failure notification sent",
            "payment_status": "failed"
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling payment: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to cancel payment"
        }), 500

@payment_bp.route('/test_email', methods=['POST'])
@cross_origin()
@token_required
def test_email(current_user):
    """Test email functionality"""
    try:
        user = User.query.get(current_user['id'])
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Create a test payment data
        test_payment_data = {
            'transaction_id': 'TEST_TXN_123',
            'amount': 100.00,
            'currency': 'INR',
            'payment_method': 'test',
            'status': 'failed'
        }
        
        print(f"Testing email to: {user.email}")
        result = EmailService.send_payment_failed_email(
            user.email,
            user.name or 'Test User',
            test_payment_data
        )
        
        return jsonify({
            "success": result,
            "message": f"Test email {'sent' if result else 'failed'} to {user.email}",
            "email_config": {
                "smtp_server": SMTP_SERVER,
                "smtp_port": SMTP_PORT,
                "email_user": EMAIL_USER
            }
        })
        
    except Exception as e:
        print(f"Error testing email: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500