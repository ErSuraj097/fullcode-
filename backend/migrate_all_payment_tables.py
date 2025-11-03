#!/usr/bin/env python3

from flask import Flask
from app.models import db
from app.models_payment import Subscription, Invoice, Order
from config import DATABASE_URI

def create_all_payment_tables():
    """Create all payment-related tables"""
    try:
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        db.init_app(app)

        with app.app_context():
            # Create tables in order to avoid foreign key issues
            # First create subscription table (no dependencies)
            Subscription.__table__.create(db.engine, checkfirst=True)
            print("Subscription table created successfully")

            # Then create order table (depends on subscription)
            Order.__table__.create(db.engine, checkfirst=True)
            print("Order table created successfully")

            # Finally create invoice table (depends on both subscription and order)
            Invoice.__table__.create(db.engine, checkfirst=True)
            print("Invoice table created successfully")

            return True

    except Exception as e:
        print(f"Error creating payment tables: {e}")
        return False

if __name__ == "__main__":
    create_all_payment_tables()
