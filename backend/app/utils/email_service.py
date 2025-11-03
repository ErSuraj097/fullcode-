import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from config import SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASS
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending payment-related emails"""
    
    @staticmethod
    def send_email(to_email, subject, html_content, text_content=None):
        """Send an email with HTML content"""
        try:
            print(f"Attempting to send email to: {to_email}")
            print(f"SMTP Config - Server: {SMTP_SERVER}, Port: {SMTP_PORT}, User: {EMAIL_USER}")
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = EMAIL_USER
            message["To"] = to_email
            
            # Create text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            print("Email message created, attempting SMTP connection...")
            
            # Create secure connection and send email
            # Use a more permissive SSL context for servers with certificate issues
            # Note: This disables SSL certificate verification for compatibility
            # with servers that have self-signed or invalid certificates
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                print("SMTP connection established")
                
                # Enable debug output
                server.set_debuglevel(1)
                
                print("Starting TLS...")
                server.starttls(context=context)
                print("TLS started successfully")
                
                print("Attempting login...")
                server.login(EMAIL_USER, EMAIL_PASS)
                print("Login successful")
                
                print("Sending email...")
                server.sendmail(EMAIL_USER, to_email, message.as_string())
                print("Email sent successfully")
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP Authentication failed: {str(e)}"
            print(error_msg)
            logger.error(error_msg)
            return False
        except smtplib.SMTPConnectError as e:
            error_msg = f"SMTP Connection failed: {str(e)}"
            print(error_msg)
            logger.error(error_msg)
            return False
        except smtplib.SMTPRecipientsRefused as e:
            error_msg = f"SMTP Recipients refused: {str(e)}"
            print(error_msg)
            logger.error(error_msg)
            return False
        except Exception as e:
            error_msg = f"Failed to send email to {to_email}: {str(e)}"
            print(error_msg)
            logger.error(error_msg)
            import traceback
            traceback.print_exc()
            return False
    
    @staticmethod
    def send_payment_success_email(user_email, user_name, payment_data):
        """Send payment success notification email"""
        subject = "Payment Successful - Transaction Confirmed"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Successful</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }}
                .success-icon {{ font-size: 48px; color: #28a745; text-align: center; margin-bottom: 20px; }}
                .details {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }}
                .detail-label {{ font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Payment Successful!</h1>
                </div>
                <div class="content">
                    <div class="success-icon">✅</div>
                    <h2>Hello {user_name},</h2>
                    <p>Great news! Your payment has been processed successfully. Here are the details of your transaction:</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Transaction ID:</span>
                            <span>{payment_data.get('transaction_id', 'N/A')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span>{payment_data.get('currency', 'INR')} {payment_data.get('amount', '0.00')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Payment Method:</span>
                            <span>{payment_data.get('payment_method', 'N/A').title()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span style="color: #28a745; font-weight: bold;">Completed</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span>{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</span>
                        </div>
                    </div>
                    
                    <p>Your payment has been confirmed and your service is now active. You can access your dashboard to manage your projects.</p>
                    
                    <p>If you have any questions or concerns about this transaction, please don't hesitate to contact our support team.</p>
                    
                    <p>Thank you for choosing our service!</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2024 Sambhasini. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Payment Successful!
        
        Hello {user_name},
        
        Your payment has been processed successfully.
        
        Transaction Details:
        - Transaction ID: {payment_data.get('transaction_id', 'N/A')}
        - Amount: {payment_data.get('currency', 'INR')} {payment_data.get('amount', '0.00')}
        - Payment Method: {payment_data.get('payment_method', 'N/A').title()}
        - Status: Completed
        - Date: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        
        Thank you for choosing our service!
        
        This is an automated message. Please do not reply to this email.
        """
        
        return EmailService.send_email(user_email, subject, html_content, text_content)
    
    @staticmethod
    def send_payment_failed_email(user_email, user_name, payment_data):
        """Send payment failure notification email"""
        subject = "Payment Failed - Action Required"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Failed</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }}
                .error-icon {{ font-size: 48px; color: #dc3545; text-align: center; margin-bottom: 20px; }}
                .details {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }}
                .detail-label {{ font-weight: bold; }}
                .retry-button {{ background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Payment Failed</h1>
                </div>
                <div class="content">
                    <div class="error-icon">❌</div>
                    <h2>Hello {user_name},</h2>
                    <p>We're sorry, but your payment could not be processed. Here are the details:</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Transaction ID:</span>
                            <span>{payment_data.get('transaction_id', 'N/A')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span>{payment_data.get('currency', 'INR')} {payment_data.get('amount', '0.00')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Payment Method:</span>
                            <span>{payment_data.get('payment_method', 'N/A').title()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span style="color: #dc3545; font-weight: bold;">Failed</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span>{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</span>
                        </div>
                    </div>
                    
                    <p><strong>What to do next:</strong></p>
                    <ul>
                        <li>Check your payment method details and try again</li>
                        <li>Ensure you have sufficient funds in your account</li>
                        <li>Contact your bank if the issue persists</li>
                        <li>Try using a different payment method</li>
                    </ul>
                    
                    <p>You can retry your payment by visiting your dashboard.</p>
                    
                    <p>If you continue to experience issues, please contact our support team for assistance.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2024 Sambhasini. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Payment Failed
        
        Hello {user_name},
        
        Your payment could not be processed.
        
        Transaction Details:
        - Transaction ID: {payment_data.get('transaction_id', 'N/A')}
        - Amount: {payment_data.get('currency', 'INR')} {payment_data.get('amount', '0.00')}
        - Payment Method: {payment_data.get('payment_method', 'N/A').title()}
        - Status: Failed
        - Date: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        
        What to do next:
        - Check your payment method details and try again
        - Ensure you have sufficient funds in your account
        - Contact your bank if the issue persists
        - Try using a different payment method
        
        You can retry your payment by visiting your dashboard.
        
        This is an automated message. Please do not reply to this email.
        """
        
        return EmailService.send_email(user_email, subject, html_content, text_content)
    
    @staticmethod
    def send_payment_pending_email(user_email, user_name, payment_data):
        """Send payment pending notification email"""
        subject = "Payment Pending - Processing Your Transaction"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Pending</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #ffc107; color: #212529; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }}
                .pending-icon {{ font-size: 48px; color: #ffc107; text-align: center; margin-bottom: 20px; }}
                .details {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }}
                .detail-label {{ font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Payment Processing</h1>
                </div>
                <div class="content">
                    <div class="pending-icon">⏳</div>
                    <h2>Hello {user_name},</h2>
                    <p>We've received your payment and it's currently being processed. Here are the details:</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Transaction ID:</span>
                            <span>{payment_data.get('transaction_id', 'N/A')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span>{payment_data.get('currency', 'INR')} {payment_data.get('amount', '0.00')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Payment Method:</span>
                            <span>{payment_data.get('payment_method', 'N/A').title()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span style="color: #ffc107; font-weight: bold;">Processing</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span>{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</span>
                        </div>
                    </div>
                    
                    <p><strong>What happens next:</strong></p>
                    <ul>
                        <li>Your payment is being verified by our payment processor</li>
                        <li>This usually takes a few minutes to complete</li>
                        <li>You'll receive another email once the payment is confirmed</li>
                        <li>Your service will be activated automatically upon confirmation</li>
                    </ul>
                    
                    <p>You can check the status of your payment in your dashboard at any time.</p>
                    
                    <p>If you have any questions, please don't hesitate to contact our support team.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2024 Sambhasini. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Payment Processing
        
        Hello {user_name},
        
        We've received your payment and it's currently being processed.
        
        Transaction Details:
        - Transaction ID: {payment_data.get('transaction_id', 'N/A')}
        - Amount: {payment_data.get('currency', 'INR')} {payment_data.get('amount', '0.00')}
        - Payment Method: {payment_data.get('payment_method', 'N/A').title()}
        - Status: Processing
        - Date: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        
        What happens next:
        - Your payment is being verified by our payment processor
        - This usually takes a few minutes to complete
        - You'll receive another email once the payment is confirmed
        - Your service will be activated automatically upon confirmation
        
        You can check the status of your payment in your dashboard at any time.
        
        This is an automated message. Please do not reply to this email.
        """
        
        return EmailService.send_email(user_email, subject, html_content, text_content)
    
    @staticmethod
    def send_payment_refund_email(user_email, user_name, payment_data):
        """Send payment refund notification email"""
        subject = "Payment Refunded - Transaction Reversed"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Refunded</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }}
                .refund-icon {{ font-size: 48px; color: #17a2b8; text-align: center; margin-bottom: 20px; }}
                .details {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }}
                .detail-label {{ font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Payment Refunded</h1>
                </div>
                <div class="content">
                    <div class="refund-icon">💰</div>
                    <h2>Hello {user_name},</h2>
                    <p>Your payment has been successfully refunded. Here are the details:</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Transaction ID:</span>
                            <span>{payment_data.get('transaction_id', 'N/A')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Refund Amount:</span>
                            <span>{payment_data.get('currency', 'INR')} {payment_data.get('amount', '0.00')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Original Payment Method:</span>
                            <span>{payment_data.get('payment_method', 'N/A').title()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span style="color: #17a2b8; font-weight: bold;">Refunded</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Refund Date:</span>
                            <span>{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</span>
                        </div>
                    </div>
                    
                    <p><strong>Important Information:</strong></p>
                    <ul>
                        <li>The refund has been processed and will appear in your account</li>
                        <li>It may take 3-5 business days for the refund to reflect in your statement</li>
                        <li>The refund will be credited to your original payment method</li>
                        <li>You will receive a separate confirmation from your bank/payment provider</li>
                    </ul>
                    
                    <p>If you have any questions about this refund or need assistance, please contact our support team.</p>
                    
                    <p>Thank you for your understanding.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2024 Sambhasini. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Payment Refunded
        
        Hello {user_name},
        
        Your payment has been successfully refunded.
        
        Refund Details:
        - Transaction ID: {payment_data.get('transaction_id', 'N/A')}
        - Refund Amount: {payment_data.get('currency', 'INR')} {payment_data.get('amount', '0.00')}
        - Original Payment Method: {payment_data.get('payment_method', 'N/A').title()}
        - Status: Refunded
        - Refund Date: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        
        Important Information:
        - The refund has been processed and will appear in your account
        - It may take 3-5 business days for the refund to reflect in your statement
        - The refund will be credited to your original payment method
        - You will receive a separate confirmation from your bank/payment provider
        
        If you have any questions about this refund, please contact our support team.
        
        This is an automated message. Please do not reply to this email.
        """
        
        return EmailService.send_email(user_email, subject, html_content, text_content)