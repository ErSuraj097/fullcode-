#!/usr/bin/env python3
"""
Database Migration Script: Add model_type and accuracy fields to projects table
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
    """Add model_type and accuracy columns to projects table"""
    try:
        # Create database engine
        engine = create_engine(DATABASE_URI)
        
        with engine.connect() as connection:
            # Start transaction
            trans = connection.begin()
            
            try:
                # Check if model_type column exists
                result = connection.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'projects' AND column_name = 'model_type'
                """))
                
                if not result.fetchone():
                    logger.info("Adding model_type column to projects table...")
                    connection.execute(text("""
                        ALTER TABLE projects 
                        ADD COLUMN model_type VARCHAR(20) DEFAULT 'basic'
                    """))
                    logger.info("✓ model_type column added successfully")
                else:
                    logger.info("✓ model_type column already exists")
                
                # Check if accuracy column exists
                result = connection.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'projects' AND column_name = 'accuracy'
                """))
                
                if not result.fetchone():
                    logger.info("Adding accuracy column to projects table...")
                    connection.execute(text("""
                        ALTER TABLE projects 
                        ADD COLUMN accuracy FLOAT DEFAULT 0.0
                    """))
                    logger.info("✓ accuracy column added successfully")
                else:
                    logger.info("✓ accuracy column already exists")
                
                # Update existing projects with default values
                logger.info("Updating existing projects with default values...")
                connection.execute(text("""
                    UPDATE projects 
                    SET model_type = 'basic' 
                    WHERE model_type IS NULL
                """))
                
                connection.execute(text("""
                    UPDATE projects 
                    SET accuracy = 0.0 
                    WHERE accuracy IS NULL
                """))
                
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
                WHERE table_name = 'projects' 
                AND column_name IN ('model_type', 'accuracy')
                ORDER BY column_name
            """))
            
            columns = result.fetchall()
            
            if len(columns) == 2:
                logger.info("✓ Migration verification successful:")
                for column in columns:
                    logger.info(f"  - {column[0]}: {column[1]} (default: {column[2]})")
                return True
            else:
                logger.error(f"✗ Migration verification failed. Expected 2 columns, found {len(columns)}")
                return False
                
    except Exception as e:
        logger.error(f"Migration verification failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting database migration for model fields...")
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