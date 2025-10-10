#!/usr/bin/env python3
"""
Database Migration Script: Add updated_at field to users table
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import logging

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import DATABASE_URI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """Add updated_at column to users table"""
    try:
        # Create database engine
        engine = create_engine(DATABASE_URI)
        
        with engine.connect() as connection:
            # Start transaction
            trans = connection.begin()
            
            try:
                # Check if updated_at column exists
                result = connection.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'updated_at'
                """))
                
                if not result.fetchone():
                    logger.info("Adding updated_at column to users table...")
                    connection.execute(text("""
                        ALTER TABLE users 
                        ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    """))
                    logger.info("✓ updated_at column added successfully")
                    
                    # Update existing users with current timestamp
                    connection.execute(text("""
                        UPDATE users 
                        SET updated_at = created_at 
                        WHERE updated_at IS NULL
                    """))
                    logger.info("✓ Existing users updated with created_at timestamp")
                else:
                    logger.info("✓ updated_at column already exists")
                
                # Commit transaction
                trans.commit()
                logger.info("✓ Database migration completed successfully!")
                
            except Exception as e:
                # Rollback on error
                trans.rollback()
                raise e
                
    except SQLAlchemyError as e:
        logger.error(f"Database migration failed: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during migration: {e}")
        return False
    
    return True

def verify_migration():
    """Verify that the migration was successful"""
    try:
        engine = create_engine(DATABASE_URI)
        
        with engine.connect() as connection:
            # Check table structure
            result = connection.execute(text("""
                SELECT column_name, data_type, column_default
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name = 'updated_at'
            """))
            
            column = result.fetchone()
            
            if column:
                logger.info("✓ Migration verification successful:")
                logger.info(f"  - {column[0]}: {column[1]} (default: {column[2]})")
                return True
            else:
                logger.error("✗ Migration verification failed. updated_at column not found")
                return False
                
    except Exception as e:
        logger.error(f"Migration verification failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting database migration for user updated_at field...")
    logger.info(f"Database URI: {DATABASE_URI}")
    
    # Run migration
    if migrate_database():
        # Verify migration
        if verify_migration():
            logger.info("🎉 Migration completed and verified successfully!")
            sys.exit(0)
        else:
            logger.error("❌ Migration verification failed!")
            sys.exit(1)
    else:
        logger.error("❌ Migration failed!")
        sys.exit(1)