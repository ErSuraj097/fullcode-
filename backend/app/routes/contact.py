from flask import Blueprint, request, jsonify
from app.models import db, Contact
from app.services.email_service import email_service
from config import logger
import re

contact_bp = Blueprint('contact', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_contact_data(data):
    """Validate contact form data"""
    errors = []
    
    # Required fields
    required_fields = ['name', 'email', 'subject', 'message']
    for field in required_fields:
        if not data.get(field) or not data[field].strip():
            errors.append(f"{field.title()} is required")
    
    # Email validation
    if data.get('email') and not validate_email(data['email']):
        errors.append("Please provide a valid email address")
    
    # Length validations
    if data.get('name') and len(data['name'].strip()) > 100:
        errors.append("Name must be less than 100 characters")
    
    if data.get('subject') and len(data['subject'].strip()) > 200:
        errors.append("Subject must be less than 200 characters")
    
    if data.get('message') and len(data['message'].strip()) > 5000:
        errors.append("Message must be less than 5000 characters")
    
    # Inquiry type validation
    valid_types = ['support', 'sales', 'partnership', 'feedback', 'other', 'general']
    if data.get('inquiry_type') and data['inquiry_type'] not in valid_types:
        errors.append("Invalid inquiry type")
    
    return errors

@contact_bp.route('/contact', methods=['POST'])
def submit_contact():
    """Handle contact form submission"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Validate input data
        validation_errors = validate_contact_data(data)
        if validation_errors:
            return jsonify({
                'success': False,
                'message': 'Validation failed',
                'errors': validation_errors
            }), 400
        
        # Clean and prepare data
        name = data['name'].strip()
        email = data['email'].strip().lower()
        subject = data['subject'].strip()
        message = data['message'].strip()
        inquiry_type = data.get('inquiry_type', 'general')
        
        # Create contact record
        contact = Contact(
            name=name,
            email=email,
            subject=subject,
            message=message,
            inquiry_type=inquiry_type
        )
        
        # Save to database
        db.session.add(contact)
        db.session.commit()
        
        # Send emails
        email_sent = email_service.send_contact_email(
            name=name,
            email=email,
            subject=subject,
            message=message,
            inquiry_type=inquiry_type
        )
        
        # Update email status
        contact.email_sent = email_sent
        db.session.commit()
        
        if email_sent:
            logger.info(f"Contact form submitted successfully by {email}")
            return jsonify({
                'success': True,
                'message': 'Thank you for your message! We\'ll get back to you within 24 hours.',
                'contact_id': contact.id
            }), 200
        else:
            logger.warning(f"Contact form submitted but email failed for {email}")
            return jsonify({
                'success': True,
                'message': 'Your message has been received. We\'ll get back to you soon.',
                'contact_id': contact.id,
                'note': 'Email notification may be delayed'
            }), 200
            
    except Exception as e:
        logger.error(f"Error processing contact form: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'An error occurred while processing your request. Please try again.'
        }), 500

@contact_bp.route('/contact/test-email', methods=['POST'])
def test_email():
    """Test email functionality (for development/admin use)"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email'):
            return jsonify({
                'success': False,
                'message': 'Email address required for testing'
            }), 400
        
        # Send test email
        success = email_service.send_contact_email(
            name="Test User",
            email=data['email'],
            subject="Email Test",
            message="This is a test message to verify email functionality.",
            inquiry_type="test"
        )
        
        return jsonify({
            'success': success,
            'message': 'Test email sent successfully' if success else 'Failed to send test email'
        }), 200 if success else 500
        
    except Exception as e:
        logger.error(f"Error sending test email: {e}")
        return jsonify({
            'success': False,
            'message': 'Error sending test email'
        }), 500

@contact_bp.route('/contact/health', methods=['GET'])
def contact_health():
    """Health check for contact service"""
    try:
        # Check database connection
        db.session.execute('SELECT 1')
        
        return jsonify({
            'success': True,
            'message': 'Contact service is healthy',
            'timestamp': Contact().created_at.isoformat() if Contact().created_at else None
        }), 200
        
    except Exception as e:
        logger.error(f"Contact service health check failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Contact service is unhealthy'
        }), 500