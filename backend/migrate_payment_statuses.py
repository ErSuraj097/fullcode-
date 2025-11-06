#!/usr/bin/env python3
"""
Migration script to standardize payment statuses from 'paid'/'unpaid' to 'success'/'pending'
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models import db, Project
from main import create_app

def migrate_payment_statuses():
    """Migrate payment statuses to standardized values"""
    app = create_app()
    with app.app_context():
        try:
            print("Starting payment status migration...")

            # Update 'paid' to 'success'
            paid_projects = Project.query.filter_by(payment_status='paid').all()
            for project in paid_projects:
                project.payment_status = 'success'
                print(f"Updated project {project.id}: 'paid' -> 'success'")

            # Update 'unpaid' to 'pending'
            unpaid_projects = Project.query.filter_by(payment_status='unpaid').all()
            for project in unpaid_projects:
                project.payment_status = 'pending'
                print(f"Updated project {project.id}: 'unpaid' -> 'pending'")

            # Commit changes
            db.session.commit()
            print(f"Migration completed successfully!")
            print(f"Updated {len(paid_projects)} 'paid' -> 'success'")
            print(f"Updated {len(unpaid_projects)} 'unpaid' -> 'pending'")

        except Exception as e:
            db.session.rollback()
            print(f"Error during migration: {e}")
            return False

    return True

if __name__ == "__main__":
    success = migrate_payment_statuses()
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
        sys.exit(1)
