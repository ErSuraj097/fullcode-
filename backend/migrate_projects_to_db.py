#!/usr/bin/env python3
"""
Migration script to move projects from JSON file to database
"""

import json
import os
from datetime import datetime
from app.models import db, Project
from main import create_app

def migrate_projects_to_database():
    """Migrate projects from JSON file to database"""
    
    projects_file = "data/projects.json"
    
    if not os.path.exists(projects_file):
        print(f"No projects file found at {projects_file}")
        return
    
    app = create_app()
    with app.app_context():
        try:
            # Load projects from JSON
            with open(projects_file, 'r', encoding='utf-8') as f:
                projects_data = json.load(f)
            
            print(f"Found {len(projects_data)} projects to migrate")
            
            migrated_count = 0
            skipped_count = 0
            
            for project_data in projects_data:
                # Check if project already exists in database
                existing_project = Project.query.filter_by(id=project_data['id']).first()
                
                if existing_project:
                    print(f"Project {project_data['id']} already exists in database, skipping...")
                    skipped_count += 1
                    continue
                
                # Create new project in database
                project = Project(
                    id=project_data['id'],
                    name=project_data['name'],
                    type=project_data['type'],
                    description=project_data.get('description', ''),
                    user_id=project_data['user_id'],
                    status=project_data.get('status', 'draft'),
                    training_status=project_data.get('training_status', 'not_trained'),
                    config=project_data.get('config', {}),
                    created_at=datetime.fromisoformat(project_data['created_at'].replace('Z', '+00:00')) if project_data.get('created_at') else datetime.utcnow(),
                    updated_at=datetime.fromisoformat(project_data['updated_at'].replace('Z', '+00:00')) if project_data.get('updated_at') else datetime.utcnow()
                )
                
                db.session.add(project)
                migrated_count += 1
                print(f"Migrated project: {project_data['name']} (ID: {project_data['id']})")
            
            # Commit all changes
            db.session.commit()
            
            print(f"\nMigration completed!")
            print(f"Migrated: {migrated_count} projects")
            print(f"Skipped: {skipped_count} projects")
            
            # Create backup of original file
            backup_file = f"{projects_file}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            os.rename(projects_file, backup_file)
            print(f"Original file backed up to: {backup_file}")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error during migration: {e}")
            raise

if __name__ == "__main__":
    migrate_projects_to_database()