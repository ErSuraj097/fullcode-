"""
Adaptive Learning System for Chatbot
Analyzes user feedback and automatically improves chatbot responses and training data
"""

import json
import os
import time
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
import threading
from config import PROJECTS_DIR, logger
from app.utils.feedback_storage import get_feedback_storage
from app.utils.data import load_projects, save_projects

class AdaptiveLearning:
    """Manages automatic learning from user feedback"""

    def __init__(self, project_id: str):
        self.project_id = project_id
        self.project_dir = os.path.join(PROJECTS_DIR, project_id)
        self.intents_file = os.path.join(self.project_dir, "intents.json")
        self.feedback_storage = get_feedback_storage(project_id)
        self.min_feedback_threshold = 5  # Minimum feedback items to trigger learning
        self.learning_interval = 3600  # 1 hour between learning cycles

    def analyze_feedback_and_update(self) -> Dict[str, Any]:
        """
        Analyze accumulated feedback and update chatbot knowledge
        Returns status of the learning operation
        """
        try:
            # Get recent feedback
            feedback_items = self.feedback_storage.get_recent_feedback(hours=24)

            if len(feedback_items) < self.min_feedback_threshold:
                return {
                    "status": "insufficient_feedback",
                    "message": f"Only {len(feedback_items)} feedback items, need at least {self.min_feedback_threshold}",
                    "feedback_count": len(feedback_items)
                }
            analysis = self._analyze_feedback_patterns(feedback_items)

            updates_made = self._update_intents_from_feedback(analysis)

            # Check if retraining is needed
            retraining_triggered = self._check_and_trigger_retraining(analysis)

            return {
                "status": "success",
                "message": f"Processed {len(feedback_items)} feedback items",
                "updates_made": updates_made,
                "retraining_triggered": retraining_triggered,
                "feedback_count": len(feedback_items)
            }

        except Exception as e:
            logger.error(f"Error in adaptive learning for project {self.project_id}: {e}")
            return {
                "status": "error",
                "message": str(e),
                "feedback_count": 0
            }

    def _analyze_feedback_patterns(self, feedback_items: List[Dict]) -> Dict[str, Any]:
        """Analyze patterns in feedback data"""
        analysis = {
            "corrections": [],
            "ratings": [],
            "alternative_responses": [],
            "common_issues": defaultdict(int),
            "intent_improvements": defaultdict(list)
        }

        for feedback in feedback_items:
            feedback_type = feedback.get("feedback_type", "")

            if feedback_type == "correction":
                analysis["corrections"].append({
                    "original_message": feedback.get("user_message", ""),
                    "bot_response": feedback.get("bot_response", ""),
                    "correction": feedback.get("correction", ""),
                    "intent": feedback.get("intent", "")
                })

            elif feedback_type == "rating":
                analysis["ratings"].append({
                    "rating": feedback.get("rating", 0),
                    "message": feedback.get("user_message", ""),
                    "response": feedback.get("bot_response", "")
                })

            elif feedback_type == "alternative_response":
                analysis["alternative_responses"].append({
                    "message": feedback.get("user_message", ""),
                    "current_response": feedback.get("bot_response", ""),
                    "suggested_response": feedback.get("alternative_response", "")
                })

            # Track common issues (low ratings, corrections)
            if feedback.get("rating", 5) < 3 or feedback_type == "correction":
                issue_key = feedback.get("intent", "unknown")
                analysis["common_issues"][issue_key] += 1

        return analysis

    def _update_intents_from_feedback(self, analysis: Dict[str, Any]) -> int:
        """Update intents.json based on feedback analysis"""
        try:
            # Load current intents
            if not os.path.exists(self.intents_file):
                logger.warning(f"Intents file not found for project {self.project_id}")
                return 0

            with open(self.intents_file, "r", encoding="utf-8") as f:
                intents_data = json.load(f)

            updates_count = 0

            # Add corrections as new patterns/responses
            for correction in analysis["corrections"]:
                intent_tag = correction.get("intent", "")
                if intent_tag:
                    # Find the intent
                    intent = self._find_intent_by_tag(intents_data, intent_tag)
                    if intent:
                        # Add the original message as a pattern if not exists
                        user_message = correction["original_message"]
                        if user_message not in intent.get("patterns", []):
                            intent["patterns"].append(user_message)
                            updates_count += 1

                        # Add correction as a response if not exists
                        correction_text = correction["correction"]
                        if correction_text not in intent.get("responses", []):
                            intent["responses"].append(correction_text)
                            updates_count += 1

            # Add alternative responses
            for alt_response in analysis["alternative_responses"]:
                intent_tag = alt_response.get("intent", "")
                if intent_tag:
                    intent = self._find_intent_by_tag(intents_data, intent_tag)
                    if intent:
                        suggested = alt_response["suggested_response"]
                        if suggested not in intent.get("responses", []):
                            intent["responses"].append(suggested)
                            updates_count += 1

            # Save updated intents if changes were made
            if updates_count > 0:
                with open(self.intents_file, "w", encoding="utf-8") as f:
                    json.dump(intents_data, f, indent=2, ensure_ascii=False)

                logger.info(f"Updated intents for project {self.project_id} with {updates_count} changes")

            return updates_count

        except Exception as e:
            logger.error(f"Error updating intents from feedback for project {self.project_id}: {e}")
            return 0

    def _check_and_trigger_retraining(self, analysis: Dict[str, Any]) -> bool:
        """Check if model retraining should be triggered"""
        try:
            # Trigger retraining if:
            # 1. Many corrections (>10 in last 24h)
            # 2. Many low ratings (>15 low ratings)
            # 3. Significant updates made to intents

            corrections_count = len(analysis["corrections"])
            low_ratings = len([r for r in analysis["ratings"] if r["rating"] < 3])

            should_retrain = corrections_count > 10 or low_ratings > 15

            if should_retrain:
                # Update project to trigger retraining
                projects = load_projects()
                project = next((p for p in projects if p["id"] == self.project_id), None)

                if project:
                    # Mark as needing retraining
                    project["needs_retraining"] = True
                    project["last_feedback_analysis"] = time.time()
                    save_projects(projects)

                    logger.info(f"Triggered retraining for project {self.project_id} due to feedback analysis")
                    return True

            return False

        except Exception as e:
            logger.error(f"Error checking retraining trigger for project {self.project_id}: {e}")
            return False

    def _find_intent_by_tag(self, intents_data: Dict, tag: str) -> Optional[Dict]:
        """Find intent by tag in intents data"""
        intents = intents_data.get("intents", [])
        for intent in intents:
            if intent.get("tag") == tag:
                return intent
        return None

    def get_learning_stats(self) -> Dict[str, Any]:
        """Get statistics about the learning process"""
        try:
            feedback_stats = self.feedback_storage.get_feedback_stats()

            # Add learning-specific stats
            learning_stats = {
                "feedback_summary": feedback_stats,
                "learning_threshold": self.min_feedback_threshold,
                "learning_interval_hours": self.learning_interval / 3600,
                "intents_file_exists": os.path.exists(self.intents_file)
            }

            # Check if project needs retraining
            projects = load_projects()
            project = next((p for p in projects if p["id"] == self.project_id), None)
            if project:
                learning_stats["needs_retraining"] = project.get("needs_retraining", False)
                learning_stats["last_analysis"] = project.get("last_feedback_analysis", 0)

            return learning_stats

        except Exception as e:
            logger.error(f"Error getting learning stats for project {self.project_id}: {e}")
            return {"error": str(e)}

# Background learning task
def background_learning_task():
    """Background task to periodically run adaptive learning"""
    while True:
        try:
            projects = load_projects()
            for project in projects:
                project_id = project["id"]
                learner = AdaptiveLearning(project_id)

                # Check if it's time for learning (based on interval)
                last_analysis = project.get("last_feedback_analysis", 0)
                if time.time() - last_analysis > learner.learning_interval:
                    result = learner.analyze_feedback_and_update()
                    if result["status"] == "success":
                        logger.info(f"Background learning completed for project {project_id}: {result}")

            time.sleep(3600)  # Check every hour

        except Exception as e:
            logger.error(f"Error in background learning task: {e}")
            time.sleep(3600)

# Start background learning thread
_learning_thread = None

def start_background_learning():
    """Start the background learning thread"""
    global _learning_thread
    if _learning_thread is None or not _learning_thread.is_alive():
        _learning_thread = threading.Thread(target=background_learning_task, daemon=True)
        _learning_thread.start()
        logger.info("Started background adaptive learning task")

def stop_background_learning():
    """Stop the background learning thread"""
    global _learning_thread
    if _learning_thread and _learning_thread.is_alive():
        # Note: Daemon threads will be terminated when main process exits
        logger.info("Background learning will stop when application exits")

# Global function for easy access
def get_adaptive_learner(project_id: str) -> AdaptiveLearning:
    """Get adaptive learning instance for a project"""
    return AdaptiveLearning(project_id)
