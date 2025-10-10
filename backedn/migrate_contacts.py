#!/usr/bin/env python3
"""
Migration script to add contacts table to the database
"""

import sys
import os
from sqlalchemy import create_engine, text
from config import DATABASE_URI, logger

def create_contacts_table():
    """Create the contacts table"""
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        inquiry_type VARCHAR(50) DEFAULT 'general',
        status VARCHAR(20) DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        email_sent BOOLEAN DEFAULT FALSE,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    
    try:
        engine = create_engine(DATABASE_URI)
        
        with engine.connect() as connection:
            # Create the table
            connection.execute(text(create_table_sql))
            connection.commit()
            
            logger.info("Contacts table created successfully")
            
            # Verify table creation
            result = connection.execute(text("SHOW TABLES LIKE 'contacts'"))
            if result.fetchone():
                logger.info("✓ Contacts table verified")
                
                # Show table structure
                result = connection.execute(text("DESCRIBE contacts"))
                columns = result.fetchall()
                
                print("\nContacts table structure:")
                print("-" * 50)
                for column in columns:
                    print(f"{column[0]:<15} {column[1]:<20} {column[2]}")
                
                return True
            else:
                logger.error("✗ Contacts table verification failed")
                return False
                
    except Exception as e:
        logger.error(f"Error creating contacts table: {e}")
        return False

def main():
    """Main migration function"""
    print("Starting contacts table migration...")
    print("=" * 50)
    
    try:
        # Create contacts table
        if create_contacts_table():
            print("\n✓ Migration completed successfully!")
            print("\nThe contacts table has been created with the following features:")
            print("- Stores contact form submissions")
            print("- Tracks email sending status")
            print("- Includes inquiry type categorization")
            print("- Has proper indexing for performance")
            return True
        else:
            print("\n✗ Migration failed!")
            return False
            
    except Exception as e:
        logger.error(f"Migration error: {e}")
        print(f"\n✗ Migration failed with error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)