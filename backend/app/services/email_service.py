import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional
from config import SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASS, logger


class EmailService:
    """Service for sending emails"""
    
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.email_user = EMAIL_USER
        self.email_pass = EMAIL_PASS
    
    def send_contact_email(self, name: str, email: str, subject: str, 
                          message: str, inquiry_type: str = "general") -> bool:
        """
        Send contact form email to admin and confirmation to user
        """
        try:
            # Send notification to admin
            admin_sent = self._send_admin_notification(name, email, subject, message, inquiry_type)
            
            # Send confirmation to user
            user_sent = self._send_user_confirmation(name, email, subject)
            
            return admin_sent and user_sent
            
        except Exception as e:
            logger.error(f"Error sending contact email: {e}")
            return False
    
    def _send_admin_notification(self, name: str, email: str, subject: str, 
                               message: str, inquiry_type: str) -> bool:
        """Send notification email to admin"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = "sy.zethat@gmail.com"  # Admin email
            msg['Subject'] = f"New Contact Form Submission: {subject}"
            
            # Create HTML email body
            html_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #e1802b; border-bottom: 2px solid #e1802b; padding-bottom: 10px;">
                        New Contact Form Submission
                    </h2>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Contact Details:</h3>
                        <p><strong>Name:</strong> {name}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Inquiry Type:</strong> {inquiry_type.title()}</p>
                        <p><strong>Submitted:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    
                    <div style="background-color: #fff; padding: 20px; border-left: 4px solid #e1802b; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Message:</h3>
                        <p style="white-space: pre-wrap;">{message}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            This email was automatically generated from the contact form on your website.
                            Please respond to the customer at: <a href="mailto:{email}">{email}</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_body, 'html'))
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.email_user, self.email_pass)
                server.send_message(msg)
            
            logger.info(f"Admin notification sent for contact from {email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending admin notification: {e}")
            return False
    
    def _send_user_confirmation(self, name: str, email: str, subject: str) -> bool:
        """Send confirmation email to user"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = email
            msg['Subject'] = f"Thank you for contacting us - {subject}"
            
            # Create HTML confirmation email
            html_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #e1802b; margin-bottom: 10px;">Thank You!</h1>
                        <p style="font-size: 18px; color: #666;">We've received your message</p>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="color: #333; margin-top: 0;">Hi {name},</h2>
                        <p>Thank you for reaching out to us! We've successfully received your inquiry about "<strong>{subject}</strong>" and our team will review it shortly.</p>
                        
                        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #e1802b; margin-top: 0;">What happens next?</h3>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Our team will review your message within 24 hours</li>
                                <li>We'll respond to you at this email address: <strong>{email}</strong></li>
                                <li>For urgent matters, you can call us at +91-120 4188947</li>
                            </ul>
                        </div>
                        
                        <p>In the meantime, feel free to explore our AI chatbot solutions and see how we can help transform your business.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://jethat.in" style="background-color: #e1802b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Visit Our Website
                        </a>
                    </div>
                    
                    <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center;">
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">
                            <strong>JetHat AI Solutions</strong><br>
                            B-508, Bhutani Technopark, Sector-127<br>
                            Noida, Uttar Pradesh - 201304, India<br>
                            Email: ai@jethat.in | Phone: +91-120 4188947
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_body, 'html'))
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.email_user, self.email_pass)
                server.send_message(msg)
            
            logger.info(f"Confirmation email sent to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending user confirmation: {e}")
            return False


# Create global email service instance
email_service = EmailService()