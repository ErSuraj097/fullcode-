#!/usr/bin/env python3
"""
MySQL Database Setup Script for Chatbot Builder
This script installs dependencies and sets up the MySQL database.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f" {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f" {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f" {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main installation function"""
    print(" Starting MySQL Database Setup for Chatbot Builder")
    print("=" * 60)
    
    # Step 1: Install Python dependencies
    print("\n Step 1: Installing Python dependencies...")
    if not run_command("pip install -r requirements.txt", "Installing Python packages"):
        print(" Failed to install dependencies. Please check your pip installation.")
        return False
    
    # Step 2: Check MySQL connection
    print("\n🔍 Step 2: Testing MySQL connection...")
    try:
        import mysql.connector
        from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_PORT
        
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT
        )
        
        if connection.is_connected():
            print(" MySQL connection successful")
            connection.close()
        else:
            print(" MySQL connection failed")
            return False
            
    except Exception as e:
        print(f" MySQL connection error: {e}")
        print("\n Please ensure:")
        print("   - MySQL server is running")
        print("   - Username and password are correct")
        print("   - MySQL server is accessible on the specified host and port")
        return False
    
    # Step 3: Initialize database
    print("\n  Step 3: Initializing database...")
    if not run_command("python init_database.py", "Database initialization"):
        print(" Database initialization failed")
        return False
    
    print("\n MySQL Database Setup Completed Successfully!")
    print("\n Next Steps:")
    print("1. Start your application: python main.py")
    print("2. Test the API endpoints")
    print("3. Verify data is being stored in MySQL")
    print("\n Tips:")
    print("- Use phpMyAdmin to view your database: http://localhost/phpmyadmin")
    print("- Your database name is: chatbot_builder")
    print("- Backup your JSON files before removing them")

if __name__ == "__main__":
    main()