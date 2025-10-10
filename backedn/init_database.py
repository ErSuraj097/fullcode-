#!/usr/bin/env python3

import mysql.connector
from mysql.connector import Error
import json
import os
from datetime import datetime
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT

def create_database():
    """Create the MySQL database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f" Database '{MYSQL_DATABASE}' created successfully or already exists")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f" Error creating database: {e}")
        return False

def create_tables():
    """Create database tables using Flask-SQLAlchemy"""
    try:
        from flask import Flask
        from app.models import db
        from config import DATABASE_URI
        
        # Create Flask app
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        # Initialize database
        db.init_app(app)
        
        with app.app_context():
            # Create all tables
            db.create_all()
            print(" Database tables created successfully")
            return True
            
    except Exception as e:
        print(f" Error creating tables: {e}")
        return False

def migrate_json_data():
    """Migrate existing JSON data to MySQL database"""
    try:
        from flask import Flask
        from app.models import db, User, Project
        from app.services.database import DatabaseService
        from config import DATABASE_URI, USERS_FILE, PROJECTS_FILE
        
        # Create Flask app
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        db.init_app(app)
        
        with app.app_context():
            # Migrate users
            if os.path.exists(USERS_FILE):
                with open(USERS_FILE, 'r') as f:
                    users_data = json.load(f)
                
                migrated_users = 0
                for user_data in users_data:
                    # Check if user already exists
                    existing_user = DatabaseService.get_user_by_email(user_data['email'])
                    if not existing_user:
                        user = User(
                            id=user_data['id'],
                            name=user_data['name'],
                            email=user_data['email'],
                            password=user_data['password'],
                            created_at=datetime.fromisoformat(user_data['created_at'].replace('Z', '+00:00')) if user_data.get('created_at') else datetime.utcnow(),
                            is_active=user_data.get('is_active', True),
                            role=user_data.get('role', 'user')
                        )
                        db.session.add(user)
                        migrated_users += 1
                
                db.session.commit()
                print(f" Migrated {migrated_users} users from JSON to database")
            
            # Migrate projects
            if os.path.exists(PROJECTS_FILE):
                with open(PROJECTS_FILE, 'r') as f:
                    projects_data = json.load(f)
                
                migrated_projects = 0
                for project_data in projects_data:
                    # Check if project already exists
                    existing_project = DatabaseService.get_project_by_id(project_data['id'])
                    if not existing_project:
                        project = Project(
                            id=project_data['id'],
                            name=project_data['name'],
                            type=project_data['type'],
                            description=project_data.get('description', ''),
                            user_id=project_data['user_id'],
                            created_at=datetime.fromisoformat(project_data['created_at'].replace('Z', '+00:00')) if project_data.get('created_at') else datetime.utcnow(),
                            updated_at=datetime.fromisoformat(project_data['updated_at'].replace('Z', '+00:00')) if project_data.get('updated_at') else datetime.utcnow(),
                            status=project_data.get('status', 'draft'),
                            training_status=project_data.get('training_status', 'not_trained'),
                            config=project_data.get('config', {})
                        )
                        db.session.add(project)
                        migrated_projects += 1
                
                db.session.commit()
                print(f" Migrated {migrated_projects} projects from JSON to database")
            
            return True
            
    except Exception as e:
        print(f" Error migrating data: {e}")
        return False

def main():
    """Main function to initialize database"""
    print("  Starting database initialization...")
    
    # Step 1: Create database
    print("\n Step 1: Creating database...")
    if not create_database():
        print(" Failed to create database. Exiting.")
        return
    
    # Step 2: Create tables
    print("\n  Step 2: Creating tables...")
    if not create_tables():
        print(" Failed to create tables. Exiting.")
        return
    
    # Step 3: Migrate existing data
    print("\n Step 3: Migrating existing JSON data...")
    if not migrate_json_data():
        print(" Failed to migrate data. Exiting.")
        return
    
    print("\n Database initialization completed successfully!")
    print("\n Next steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Update your application to use the new database service")
    print("3. Test the application with the new database")
    print("4. Backup your JSON files before removing them")

if __name__ == "__main__":
    main()