#!/usr/bin/env python3
"""
Migration script to add paytm_order_id field to payments table
"""

import mysql.connector
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT

def add_paytm_order_id_column():
    """Add paytm_order_id column to payments table"""
    try:
        # Connect to MySQL database
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            port=MYSQL_PORT
        )

        cursor = connection.cursor()

        # Check if column already exists
        cursor.execute("SHOW COLUMNS FROM payments LIKE 'paytm_order_id'")
        result = cursor.fetchone()

        if result:
            print("paytm_order_id column already exists in payments table")
            return

        # Add the column
        alter_query = """
        ALTER TABLE payments
        ADD COLUMN paytm_order_id VARCHAR(100) UNIQUE NULL
        """

        cursor.execute(alter_query)
        connection.commit()

        print("Successfully added paytm_order_id column to payments table")

    except mysql.connector.Error as error:
        print(f"Error adding paytm_order_id column: {error}")

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    add_paytm_order_id_column()
