"""
Training Progress Tracker
Provides real-time training progress updates
"""

import os
import json
import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from config import PROJECTS_DIR

logger = logging.getLogger(__name__)

class TrainingProgressTracker:
    """Track and manage training progress for projects"""
    
    def __init__(self):
        self.progress_dir = os.path.join(PROJECTS_DIR, ".training_progress")
        os.makedirs(self.progress_dir, exist_ok=True)
    
    def start_training(self, project_id: str, model_type: str = "basic", estimated_time: int = 60) -> None:
        """Start tracking training progress"""
        progress_file = os.path.join(self.progress_dir, f"{project_id}.json")
        
        progress_data = {
            "project_id": project_id,
            "model_type": model_type,
            "status": "training",
            "progress": 0,
            "current_epoch": 0,
            "total_epochs": self._get_estimated_epochs(model_type),
            "start_time": datetime.utcnow().isoformat(),
            "estimated_completion": (datetime.utcnow() + timedelta(seconds=estimated_time)).isoformat(),
            "estimated_time": estimated_time,
            "current_loss": None,
            "best_accuracy": 0,
            "message": f"Starting {model_type} model training..."
        }
        
        with open(progress_file, "w") as f:
            json.dump(progress_data, f, indent=2)
        
        logger.info(f"Started tracking training progress for project {project_id}")
    
    def update_progress(self, project_id: str, epoch: int, loss: float = None, accuracy: float = None, message: str = None) -> None:
        """Update training progress"""
        progress_file = os.path.join(self.progress_dir, f"{project_id}.json")
        
        if not os.path.exists(progress_file):
            logger.warning(f"Progress file not found for project {project_id}")
            return
        
        try:
            with open(progress_file, "r") as f:
                progress_data = json.load(f)
            
            total_epochs = progress_data.get("total_epochs", 50)
            progress_percentage = min(100, (epoch / total_epochs) * 100)
            
            progress_data.update({
                "progress": round(progress_percentage, 1),
                "current_epoch": epoch,
                "current_loss": loss,
                "last_updated": datetime.utcnow().isoformat()
            })
            
            if accuracy is not None:
                progress_data["best_accuracy"] = max(progress_data.get("best_accuracy", 0), accuracy)
            
            if message:
                progress_data["message"] = message
            else:
                progress_data["message"] = f"Training epoch {epoch}/{total_epochs}..."
            
            # Update estimated completion time
            if epoch > 0:
                start_time = datetime.fromisoformat(progress_data["start_time"])
                elapsed = (datetime.utcnow() - start_time).total_seconds()
                estimated_total = (elapsed / epoch) * total_epochs
                estimated_completion = start_time + timedelta(seconds=estimated_total)
                progress_data["estimated_completion"] = estimated_completion.isoformat()
            
            with open(progress_file, "w") as f:
                json.dump(progress_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error updating progress for project {project_id}: {e}")
    
    def complete_training(self, project_id: str, success: bool = True, final_accuracy: float = None, error_message: str = None) -> None:
        """Mark training as completed"""
        progress_file = os.path.join(self.progress_dir, f"{project_id}.json")
        
        if not os.path.exists(progress_file):
            return
        
        try:
            with open(progress_file, "r") as f:
                progress_data = json.load(f)
            
            progress_data.update({
                "status": "completed" if success else "failed",
                "progress": 100 if success else progress_data.get("progress", 0),
                "completion_time": datetime.utcnow().isoformat(),
                "message": "Training completed successfully!" if success else f"Training failed: {error_message or 'Unknown error'}"
            })
            
            if final_accuracy is not None:
                progress_data["final_accuracy"] = final_accuracy
                progress_data["best_accuracy"] = max(progress_data.get("best_accuracy", 0), final_accuracy)
            
            with open(progress_file, "w") as f:
                json.dump(progress_data, f, indent=2)
            
            # Clean up after 24 hours
            self._schedule_cleanup(project_id)
                
        except Exception as e:
            logger.error(f"Error completing training progress for project {project_id}: {e}")
    
    def get_progress(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get current training progress"""
        progress_file = os.path.join(self.progress_dir, f"{project_id}.json")
        
        if not os.path.exists(progress_file):
            return None
        
        try:
            with open(progress_file, "r") as f:
                progress_data = json.load(f)
            
            # Check if progress is stale (older than 10 minutes and still training)
            if progress_data.get("status") == "training":
                last_updated = progress_data.get("last_updated", progress_data.get("start_time"))
                if last_updated:
                    last_update_time = datetime.fromisoformat(last_updated)
                    if datetime.utcnow() - last_update_time > timedelta(minutes=10):
                        progress_data["status"] = "stale"
                        progress_data["message"] = "Training appears to have stalled"
            
            return progress_data
            
        except Exception as e:
            logger.error(f"Error getting progress for project {project_id}: {e}")
            return None
    
    def cleanup_progress(self, project_id: str) -> None:
        """Clean up progress tracking files"""
        progress_file = os.path.join(self.progress_dir, f"{project_id}.json")
        
        try:
            if os.path.exists(progress_file):
                os.remove(progress_file)
                logger.info(f"Cleaned up progress file for project {project_id}")
        except Exception as e:
            logger.error(f"Error cleaning up progress file for project {project_id}: {e}")
    
    def _get_estimated_epochs(self, model_type: str) -> int:
        """Get estimated epochs based on model type"""
        epoch_map = {
            "basic": 50,
            "medium": 100,
            "advanced": 150,
            "transformer_basic": 3,
            "transformer_medium": 5,
            "transformer_advanced": 8
        }
        return epoch_map.get(model_type, 50)
    
    def _schedule_cleanup(self, project_id: str) -> None:
        """Schedule cleanup of progress files (placeholder for future implementation)"""
        # In a production environment, you might want to use a task queue like Celery
        # For now, we'll just log that cleanup should happen
        logger.info(f"Progress file for project {project_id} should be cleaned up in 24 hours")

# Global instance
training_progress_tracker = TrainingProgressTracker()