"""
Training Notifications System
Provides notifications for training events
"""

import logging
from typing import Dict, Any, List
from datetime import datetime
from config import logger

class TrainingNotificationManager:
    """Manage training notifications and alerts"""
    
    def __init__(self):
        self.notifications = []
        self.max_notifications = 100
    
    def add_notification(self, project_id: str, message: str, notification_type: str = "info", user_id: str = None) -> None:
        """Add a training notification"""
        notification = {
            "id": f"{project_id}_{int(datetime.utcnow().timestamp())}",
            "project_id": project_id,
            "user_id": user_id,
            "message": message,
            "type": notification_type,  # info, success, warning, error
            "timestamp": datetime.utcnow().isoformat(),
            "read": False
        }
        
        self.notifications.insert(0, notification)
        
        # Keep only the latest notifications
        if len(self.notifications) > self.max_notifications:
            self.notifications = self.notifications[:self.max_notifications]
        
        logger.info(f"Training notification added: {message}")
    
    def get_notifications(self, user_id: str = None, project_id: str = None, unread_only: bool = False) -> List[Dict[str, Any]]:
        """Get notifications for a user or project"""
        filtered_notifications = self.notifications
        
        if user_id:
            filtered_notifications = [n for n in filtered_notifications if n.get("user_id") == user_id]
        
        if project_id:
            filtered_notifications = [n for n in filtered_notifications if n.get("project_id") == project_id]
        
        if unread_only:
            filtered_notifications = [n for n in filtered_notifications if not n.get("read", False)]
        
        return filtered_notifications
    
    def mark_as_read(self, notification_id: str) -> bool:
        """Mark a notification as read"""
        for notification in self.notifications:
            if notification["id"] == notification_id:
                notification["read"] = True
                return True
        return False
    
    def mark_all_as_read(self, user_id: str = None, project_id: str = None) -> int:
        """Mark all notifications as read for a user or project"""
        count = 0
        for notification in self.notifications:
            if (not user_id or notification.get("user_id") == user_id) and \
               (not project_id or notification.get("project_id") == project_id):
                if not notification.get("read", False):
                    notification["read"] = True
                    count += 1
        return count
    
    def clear_old_notifications(self, days: int = 7) -> int:
        """Clear notifications older than specified days"""
        cutoff_time = datetime.utcnow().timestamp() - (days * 24 * 60 * 60)
        
        original_count = len(self.notifications)
        self.notifications = [
            n for n in self.notifications 
            if datetime.fromisoformat(n["timestamp"]).timestamp() > cutoff_time
        ]
        
        removed_count = original_count - len(self.notifications)
        if removed_count > 0:
            logger.info(f"Cleared {removed_count} old training notifications")
        
        return removed_count

# Global notification manager
training_notification_manager = TrainingNotificationManager()

# Convenience functions
def notify_training_started(project_id: str, model_type: str, user_id: str = None):
    """Notify that training has started"""
    message = f"Training started for {model_type} model"
    training_notification_manager.add_notification(project_id, message, "info", user_id)

def notify_training_completed(project_id: str, model_type: str, accuracy: float, user_id: str = None):
    """Notify that training has completed successfully"""
    message = f"Training completed! {model_type} model achieved {accuracy:.1%} accuracy"
    training_notification_manager.add_notification(project_id, message, "success", user_id)

def notify_training_failed(project_id: str, error_message: str, user_id: str = None):
    """Notify that training has failed"""
    message = f"Training failed: {error_message}"
    training_notification_manager.add_notification(project_id, message, "error", user_id)

def notify_auto_training(project_id: str, intent_count: int, user_id: str = None):
    """Notify that auto-training has been triggered"""
    message = f"Auto-training triggered with {intent_count} intents"
    training_notification_manager.add_notification(project_id, message, "info", user_id)