"""
Feedback Storage Utility for Adaptive Learning
Handles persistent storage and retrieval of user feedback for chatbot improvement
"""

import json
import os
import time
from typing import Dict, List, Any, Optional
from config import PROJECTS_DIR, logger

class FeedbackStorage:
    """Manages storage and retrieval of user feedback for adaptive learning"""

    def __init__(self, project_id: str):
        self.project_id = project_id
        self.project_dir = os.path.join(PROJECTS_DIR, project_id)
        self.feedback_file = os.path.join(self.project_dir, "feedback.json")
        self.ensure_project_dir()

    def ensure_project_dir(self):
        """Ensure project directory exists"""
        if not os.path.exists(self.project_dir):
            os.makedirs(self.project_dir, exist_ok=True)

    def store_feedback(self, feedback_data: Dict[str, Any]) -> bool:
        """
        Store user feedback persistently

        Args:
            feedback_data: Dictionary containing feedback information
                Required keys: user_message, bot_response, feedback_type
                Optional keys: user_id, rating, correction, timestamp, intent

        Returns:
            bool: True if stored successfully, False otherwise
        """
        try:
            # Load existing feedback
            existing_feedback = self.load_feedback()

            # Add timestamp if not provided
            if 'timestamp' not in feedback_data:
                feedback_data['timestamp'] = time.time()

            # Add unique ID
            feedback_data['id'] = f"{int(time.time() * 1000)}_{hash(str(feedback_data))}"

            # Append new feedback
            existing_feedback.append(feedback_data)

            # Save back to file
            with open(self.feedback_file, 'w', encoding='utf-8') as f:
                json.dump(existing_feedback, f, indent=2, ensure_ascii=False)

            logger.info(f"Stored feedback for project {self.project_id}: {feedback_data.get('feedback_type', 'unknown')}")
            return True

        except Exception as e:
            logger.error(f"Error storing feedback for project {self.project_id}: {e}")
            return False

    def load_feedback(self) -> List[Dict[str, Any]]:
        """Load all stored feedback for the project"""
        try:
            if os.path.exists(self.feedback_file):
                with open(self.feedback_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Error loading feedback for project {self.project_id}: {e}")
            return []

    def get_recent_feedback(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get feedback from the last N hours"""
        try:
            all_feedback = self.load_feedback()
            cutoff_time = time.time() - (hours * 3600)

            return [f for f in all_feedback if f.get('timestamp', 0) > cutoff_time]
        except Exception as e:
            logger.error(f"Error getting recent feedback for project {self.project_id}: {e}")
            return []

    def get_feedback_by_type(self, feedback_type: str) -> List[Dict[str, Any]]:
        """Get feedback filtered by type (correction, rating, etc.)"""
        try:
            all_feedback = self.load_feedback()
            return [f for f in all_feedback if f.get('feedback_type') == feedback_type]
        except Exception as e:
            logger.error(f"Error getting feedback by type for project {self.project_id}: {e}")
            return []

    def get_feedback_stats(self) -> Dict[str, Any]:
        """Get statistics about stored feedback"""
        try:
            all_feedback = self.load_feedback()

            stats = {
                'total_feedback': len(all_feedback),
                'feedback_types': {},
                'avg_rating': 0,
                'corrections_count': 0,
                'recent_feedback_24h': len(self.get_recent_feedback(24))
            }

            ratings = []
            for feedback in all_feedback:
                fb_type = feedback.get('feedback_type', 'unknown')
                stats['feedback_types'][fb_type] = stats['feedback_types'].get(fb_type, 0) + 1

                if fb_type == 'correction':
                    stats['corrections_count'] += 1

                if 'rating' in feedback:
                    ratings.append(feedback['rating'])

            if ratings:
                stats['avg_rating'] = sum(ratings) / len(ratings)

            return stats

        except Exception as e:
            logger.error(f"Error getting feedback stats for project {self.project_id}: {e}")
            return {'error': str(e)}

    def clear_old_feedback(self, days: int = 30) -> int:
        """Clear feedback older than specified days, return number cleared"""
        try:
            all_feedback = self.load_feedback()
            cutoff_time = time.time() - (days * 24 * 3600)

            new_feedback = [f for f in all_feedback if f.get('timestamp', 0) > cutoff_time]
            cleared_count = len(all_feedback) - len(new_feedback)

            if cleared_count > 0:
                with open(self.feedback_file, 'w', encoding='utf-8') as f:
                    json.dump(new_feedback, f, indent=2, ensure_ascii=False)

                logger.info(f"Cleared {cleared_count} old feedback entries for project {self.project_id}")

            return cleared_count

        except Exception as e:
            logger.error(f"Error clearing old feedback for project {self.project_id}: {e}")
            return 0

# Global function for easy access
def get_feedback_storage(project_id: str) -> FeedbackStorage:
    """Get feedback storage instance for a project"""
    return FeedbackStorage(project_id)
