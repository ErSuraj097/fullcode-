#!/usr/bin/env python3

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from flask import Flask
from app.models import db  # your SQLAlchemy models here
from config import DATABASE_URI, MYSQL_DATABASE
import os

def create_database():
    """Create the MySQL database if it doesn't exist using SQLAlchemy"""
    try:
        # Extract base URI (without database name)
        base_uri = DATABASE_URI.rsplit("/", 1)[0]
        engine = create_engine(base_uri)

        with engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            print(f"✅ Database '{MYSQL_DATABASE}' created successfully or already exists")

        engine.dispose()
        return True
    except SQLAlchemyError as e:
        print(f"❌ Error creating database: {e}")
        return False


def create_tables():
    """Create all tables defined in models using Flask-SQLAlchemy ORM"""
    try:
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        db.init_app(app)

        with app.app_context():
            db.create_all()
            print("✅ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False


# Optional: JSON → ORM migration (if needed)
# def migrate_json_data():
#     """Migrate JSON data (users/projects) to the new ORM database"""
#     try:
#         from app.models import User, Project
#         from config import USERS_FILE, PROJECTS_FILE
#         from datetime import datetime
#         import json

#         app = Flask(__name__)
#         app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
#         app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#         db.init_app(app)

#         with app.app_context():
#             # Migrate users
#             if os.path.exists(USERS_FILE):
#                 with open(USERS_FILE, "r") as f:
#                     users = json.load(f)

#                 migrated_users = 0
#                 for u in users:
#                     if not User.query.filter_by(email=u["email"]).first():
#                         db.session.add(User(
#                             id=u["id"],
#                             name=u["name"],
#                             email=u["email"],
#                             password=u["password"],
#                             role=u.get("role", "user"),
#                             is_active=u.get("is_active", True),
#                             created_at=datetime.fromisoformat(
#                                 u["created_at"].replace("Z", "+00:00")
#                             ) if u.get("created_at") else datetime.utcnow()
#                         ))
#                         migrated_users += 1

#                 db.session.commit()
#                 print(f"✅ Migrated {migrated_users} users")

#             # Migrate projects
#             if os.path.exists(PROJECTS_FILE):
#                 with open(PROJECTS_FILE, "r") as f:
#                     projects = json.load(f)

#                 migrated_projects = 0
#                 for p in projects:
#                     if not Project.query.filter_by(id=p["id"]).first():
#                         db.session.add(Project(
#                             id=p["id"],
#                             name=p["name"],
#                             type=p["type"],
#                             description=p.get("description", ""),
#                             user_id=p["user_id"],
#                             status=p.get("status", "draft"),
#                             training_status=p.get("training_status", "not_trained"),
#                             config=p.get("config", {}),
#                             created_at=datetime.fromisoformat(
#                                 p["created_at"].replace("Z", "+00:00")
#                             ) if p.get("created_at") else datetime.utcnow(),
#                             updated_at=datetime.fromisoformat(
#                                 p["updated_at"].replace("Z", "+00:00")
#                             ) if p.get("updated_at") else datetime.utcnow(),
#                         ))
#                         migrated_projects += 1

#                 db.session.commit()
#                 print(f"✅ Migrated {migrated_projects} projects")

#         return True

#     except Exception as e:
#         print(f"❌ Error migrating data: {e}")
#         return False


def main():
    """Main database initialization routine"""
    print("🚀 Starting database initialization...")

    # Step 1: Create Database
    print("\n🧱 Step 1: Creating database...")
    if not create_database():
        print("❌ Failed to create database. Exiting.")
        return

    # Step 2: Create Tables
    print("\n📦 Step 2: Creating tables...")
    if not create_tables():
        print("❌ Failed to create tables. Exiting.")
        return

    # Step 3: Optional Data Migration
    # print("\n📂 Step 3: Migrating JSON data...")
    # if not migrate_json_data():
    #     print("❌ Failed to migrate data. Exiting.")
    #     return

    print("\n✅ Database initialization completed successfully!")
    print("\nNext steps:")
    print("1️⃣ Run: pip install -r requirements.txt")
    print("2️⃣ Test app with SQLAlchemy ORM DB connection")
    print("3️⃣ Backup old JSON data if applicable")


if __name__ == "__main__":
    main()
