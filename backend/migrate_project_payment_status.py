#!/usr/bin/env python3
"""
Migration script to add payment_status column to projects table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from app.models import db
from config import DATABASE_URI
import sqlalchemy as sa

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    return app

def migrate():
    """Add payment_status column to projects table"""
    try:
        app = create_app()

        with app.app_context():
            # Use SQLAlchemy inspector to check columns
            inspector = sa.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('projects')]

            if 'payment_status' not in columns:
                print("Adding payment_status column to projects table...")

                # Use proper SQLAlchemy migration
                with db.engine.connect() as conn:
                    conn.execute(sa.text("ALTER TABLE projects ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid'"))
                    conn.commit()

                print("Migration completed successfully!")
            else:
                print("payment_status column already exists.")

    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()
