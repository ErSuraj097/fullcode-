from app.models import db, User, Project, OTP
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
import secrets

class DatabaseService:
    
    @staticmethod
    def create_user(name, email, password, role='user'):
        """Create a new user"""
        try:
            user = User(
                name=name,
                email=email,
                password=password,
                role=role
            )
            db.session.add(user)
            db.session.commit()
            return user
        except IntegrityError:
            db.session.rollback()
            return None
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        return User.query.get(user_id)
    
    @staticmethod
    def get_all_users():
        """Get all users"""
        return User.query.all()
    
    @staticmethod
    def update_user_password(email, new_password):
        """Update user password"""
        user = User.query.filter_by(email=email).first()
        if user:
            user.password = new_password
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def create_project(name, project_type, description, user_id, config=None):
        """Create a new project"""
        project = Project(
            name=name,
            type=project_type,
            description=description,
            user_id=user_id,
            config=config or {}
        )
        db.session.add(project)
        db.session.commit()
        return project
    
    @staticmethod
    def get_user_projects(user_id):
        """Get all projects for a user"""
        return Project.query.filter_by(user_id=user_id).all()
    
    @staticmethod
    def get_project_by_id(project_id):
        """Get project by ID"""
        return Project.query.get(project_id)
    
    @staticmethod
    def update_project(project_id, **kwargs):
        """Update project"""
        project = Project.query.get(project_id)
        if project:
            for key, value in kwargs.items():
                if hasattr(project, key):
                    setattr(project, key, value)
            project.updated_at = datetime.utcnow()
            db.session.commit()
            return project
        return None
    
    @staticmethod
    def delete_project(project_id):
        """Delete project"""
        project = Project.query.get(project_id)
        if project:
            db.session.delete(project)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def save_otp(email, otp_code, ttl_minutes=5):
        """Save OTP for email verification"""
        # Clean up expired OTPs for this email
        OTP.query.filter_by(email=email).filter(
            OTP.expires_at < datetime.utcnow()
        ).delete()
        
        # Create new OTP
        expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)
        otp = OTP(
            email=email,
            otp_code=otp_code,
            expires_at=expires_at
        )
        db.session.add(otp)
        db.session.commit()
        return otp
    
    @staticmethod
    def verify_otp(email, otp_code):
        """Verify OTP"""
        otp = OTP.query.filter_by(
            email=email,
            otp_code=otp_code,
            is_used=False
        ).filter(
            OTP.expires_at > datetime.utcnow()
        ).first()
        print(otp)
        if otp:
            otp.is_used = True
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def check_otp_verified(email, otp_code):
        """Check if OTP was recently verified (within last 10 minutes)"""
        # Check if there's a recently used OTP for this email
        recent_otp = OTP.query.filter_by(
            email=email,
            otp_code=otp_code,
            is_used=True
        ).filter(
            OTP.expires_at > datetime.utcnow() - timedelta(minutes=10)  # Allow 10 minutes after verification
        ).first()
        
        return recent_otp is not None
    
    @staticmethod
    def cleanup_expired_otps():
        """Clean up expired OTPs"""
        expired_count = OTP.query.filter(
            OTP.expires_at < datetime.utcnow()
        ).delete()
        db.session.commit()
        return expired_count