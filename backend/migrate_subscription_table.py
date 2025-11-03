#!/usr/bin/env python3

from flask import Flask
from app.models import db
from app.models_payment import Subscription
from config import DATABASE_URI

def create_subscription_table():
    """Create the subscription table"""
    try:
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        db.init_app(app)

        with app.app_context():
            # Create the subscription table
            Subscription.__table__.create(db.engine, checkfirst=True)
            print("Subscription table created successfully")
            return True

    except Exception as e:
        print(f"Error creating subscription table: {e}")
        return False

if __name__ == "__main__":
    create_subscription_table()
