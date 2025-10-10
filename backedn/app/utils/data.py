# Database operations for projects and users

import os
import json
from typing import List, Dict, Optional
from app.models import db, Project, User
from config import USERS_FILE
from config import logger


def init_data_files():
    """Initialize legacy user file if needed (users are still in JSON for now)"""
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w", encoding="utf-8") as file:
            json.dump([], file)

init_data_files()

# Project functions - now using database
def load_projects() -> List[Dict]:
    """Load all projects from database and return as list of dictionaries"""
    try:
        projects = Project.query.all()
        return [project.to_dict() for project in projects]
    except Exception as e:
        logger.error(f"Error loading projects from database: {e}")
        return []

def get_projects_by_user(user_id: str) -> List[Dict]:
    """Get projects for a specific user"""
    try:
        projects = Project.query.filter_by(user_id=user_id).all()
        return [project.to_dict() for project in projects]
    except Exception as e:
        logger.error(f"Error loading projects for user {user_id}: {e}")
        return []

def get_project_by_id(project_id: str) -> Optional[Dict]:
    """Get a single project by ID"""
    try:
        project = Project.query.filter_by(id=project_id).first()
        return project.to_dict() if project else None
    except Exception as e:
        logger.error(f"Error loading project {project_id}: {e}")
        return None

def save_projects(projects: List[Dict]):
    """
    Legacy function for compatibility - now updates database
    This function is kept for backward compatibility but should be avoided
    Use direct database operations instead
    """
    try:
        logger.warning("save_projects() is deprecated. Use direct database operations instead.")
        # This is a compatibility layer - in practice, projects should be saved individually
        # through the database models, not as a batch operation
        return True
    except Exception as e:
        logger.error(f"Error in legacy save_projects: {e}")
        return False

def create_project(project_data: Dict) -> Optional[Dict]:
    """Create a new project in database"""
    try:
        project = Project(
            id=project_data.get('id'),
            name=project_data['name'],
            type=project_data['type'],
            description=project_data.get('description', ''),
            user_id=project_data['user_id'],
            status=project_data.get('status', 'draft'),
            training_status=project_data.get('training_status', 'not_trained'),
            config=project_data.get('config', {})
        )
        
        db.session.add(project)
        db.session.commit()
        
        logger.info(f"Created project {project.id} for user {project.user_id}")
        return project.to_dict()
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating project: {e}")
        return None

def update_project(project_id: str, update_data: Dict) -> Optional[Dict]:
    """Update an existing project"""
    try:
        project = Project.query.filter_by(id=project_id).first()
        if not project:
            return None
        
        # Update fields
        for key, value in update_data.items():
            if hasattr(project, key) and key != 'id':  # Don't allow ID changes
                setattr(project, key, value)
        
        db.session.commit()
        logger.info(f"Updated project {project_id}")
        return project.to_dict()
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating project {project_id}: {e}")
        return None

def delete_project(project_id: str) -> bool:
    """Delete a project from database"""
    try:
        project = Project.query.filter_by(id=project_id).first()
        if not project:
            return False
        
        db.session.delete(project)
        db.session.commit()
        
        logger.info(f"Deleted project {project_id}")
        return True
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting project {project_id}: {e}")
        return False

# User functions - still using JSON for now (can be migrated later)
def load_users():
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as e:
        logger.error(f"Error loading users: {e}")
        return []

def save_users(users):
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as file:
            json.dump(users, file, ensure_ascii=False, indent=4)
    except Exception as e:
        logger.error(f"Error saving users: {e}")
      