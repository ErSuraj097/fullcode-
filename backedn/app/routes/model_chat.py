"""
Model-Specific Chat APIs
Separate endpoints for Basic, Medium (BERT), and Advanced models
"""

import os
import json
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.utils.security import token_required
from app.models import db, Project
from config import PROJECTS_DIR
from chatbot_model.models.transformer_models import TransformerChatbot
from chatbot_model.models.model import ChatbotModel
from chatbot_model.utils.nltk_utils import tokenize, bag_of_words
from chatbot_model.utils.response_selector import response_selector

model_chat_bp = Blueprint('model_chat', __name__)
logger = logging.getLogger(__name__)

# Basic Model Chat API
@model_chat_bp.route('/projects/<project_id>/chat/basic', methods=['POST'])
@token_required
def chat_with_basic_model(current_user, project_id):
    """Chat with basic neural network model"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Check if model is trained
        if project.training_status != "trained":
            return jsonify({"error": "Model not trained. Please train the model first."}), 400
        
        # Load basic model
        model_path = os.path.join(PROJECTS_DIR, project_id, "model.pth")
        words_path = os.path.join(PROJECTS_DIR, project_id, "words.pkl")
        classes_path = os.path.join(PROJECTS_DIR, project_id, "classes.pkl")
        intents_path = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        
        if not all(os.path.exists(p) for p in [model_path, words_path, classes_path, intents_path]):
            return jsonify({"error": "Basic model files not found. Please retrain the model."}), 404
        
        try:
            # Load model and data
            chatbot_model = ChatbotModel()
            chatbot_model.load_model(project_id)
            
            with open(intents_path, 'r', encoding='utf-8') as f:
                intents_data = json.load(f)
            
            # Get prediction
            prediction = chatbot_model.predict(message)
            
            if prediction and "error" not in prediction:
                intent = prediction.get("intent", "unknown")
                confidence = prediction.get("confidence", 0.0)
                
                # Get response using response selector
                response = response_selector.get_response(intent, intents_data, message)
                
                return jsonify({
                    "response": response,
                    "intent": intent,
                    "confidence": confidence,
                    "model_type": "basic",
                    "technology": "Neural Network",
                    "timestamp": datetime.utcnow().isoformat()
                })
            else:
                return jsonify({
                    "response": "I'm not sure how to respond to that.",
                    "intent": "unknown",
                    "confidence": 0.0,
                    "model_type": "basic",
                    "technology": "Neural Network",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
        except Exception as model_error:
            logger.error(f"Basic model prediction error: {model_error}")
            return jsonify({
                "response": "I'm having trouble processing your request right now.",
                "intent": "error",
                "confidence": 0.0,
                "model_type": "basic",
                "error": str(model_error),
                "timestamp": datetime.utcnow().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Basic chat error: {e}")
        return jsonify({"error": f"Chat failed: {str(e)}"}), 500

# Medium Model Chat API (BERT)
@model_chat_bp.route('/projects/<project_id>/chat/medium', methods=['POST'])
@token_required
def chat_with_medium_model(current_user, project_id):
    """Chat with medium BERT-based model"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Check if model is trained
        if project.training_status != "trained":
            return jsonify({"error": "Model not trained. Please train the model first."}), 400
        
        try:
            # Load medium transformer model
            chatbot = TransformerChatbot(model_type="medium")
            
            # Try to load trained model
            if not chatbot.load_trained_model(project_id):
                # Fallback to basic model if transformer model not available
                return _fallback_to_basic_chat(project_id, message, "medium")
            
            # Get prediction
            prediction = chatbot.predict(message)
            
            if prediction and "error" not in prediction:
                return jsonify({
                    "response": prediction.get("response", "I'm not sure how to respond to that."),
                    "intent": prediction.get("intent", "unknown"),
                    "confidence": prediction.get("confidence", 0.0),
                    "model_type": "medium",
                    "technology": "BERT",
                    "timestamp": datetime.utcnow().isoformat()
                })
            else:
                # Fallback to basic model
                return _fallback_to_basic_chat(project_id, message, "medium")
                
        except Exception as model_error:
            logger.warning(f"Medium model error, falling back to basic: {model_error}")
            return _fallback_to_basic_chat(project_id, message, "medium")
            
    except Exception as e:
        logger.error(f"Medium chat error: {e}")
        return jsonify({"error": f"Chat failed: {str(e)}"}), 500

# Advanced Model Chat API (RoBERTa)
@model_chat_bp.route('/projects/<project_id>/chat/advanced', methods=['POST'])
@token_required
def chat_with_advanced_model(current_user, project_id):
    """Chat with advanced RoBERTa-based model"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Check if model is trained
        if project.training_status != "trained":
            return jsonify({"error": "Model not trained. Please train the model first."}), 400
        
        try:
            # Load advanced transformer model
            chatbot = TransformerChatbot(model_type="advanced")
            
            # Try to load trained model
            if not chatbot.load_trained_model(project_id):
                # Fallback to basic model if transformer model not available
                return _fallback_to_basic_chat(project_id, message, "advanced")
            
            # Get prediction
            prediction = chatbot.predict(message)
            
            if prediction and "error" not in prediction:
                return jsonify({
                    "response": prediction.get("response", "I'm not sure how to respond to that."),
                    "intent": prediction.get("intent", "unknown"),
                    "confidence": prediction.get("confidence", 0.0),
                    "model_type": "advanced",
                    "technology": "RoBERTa",
                    "timestamp": datetime.utcnow().isoformat()
                })
            else:
                # Fallback to basic model
                return _fallback_to_basic_chat(project_id, message, "advanced")
                
        except Exception as model_error:
            logger.warning(f"Advanced model error, falling back to basic: {model_error}")
            return _fallback_to_basic_chat(project_id, message, "advanced")
            
    except Exception as e:
        logger.error(f"Advanced chat error: {e}")
        return jsonify({"error": f"Chat failed: {str(e)}"}), 500

# Auto-Select Model Chat API
@model_chat_bp.route('/projects/<project_id>/chat/auto', methods=['POST'])
@token_required
def chat_with_auto_model(current_user, project_id):
    """Chat using the project's selected model type"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Get project's model type
        model_type = project.model_type or "basic"
        
        # Route to appropriate model endpoint
        if model_type == "basic":
            return chat_with_basic_model(current_user, project_id)
        elif model_type == "medium":
            return chat_with_medium_model(current_user, project_id)
        elif model_type == "advanced":
            return chat_with_advanced_model(current_user, project_id)
        else:
            # Default to basic
            return chat_with_basic_model(current_user, project_id)
            
    except Exception as e:
        logger.error(f"Auto chat error: {e}")
        return jsonify({"error": f"Chat failed: {str(e)}"}), 500

# Helper function for fallback chat
def _fallback_to_basic_chat(project_id, message, original_model_type):
    """Fallback to basic model when transformer models fail"""
    try:
        # Load basic model
        model_path = os.path.join(PROJECTS_DIR, project_id, "model.pth")
        words_path = os.path.join(PROJECTS_DIR, project_id, "words.pkl")
        classes_path = os.path.join(PROJECTS_DIR, project_id, "classes.pkl")
        intents_path = os.path.join(PROJECTS_DIR, project_id, "intents.json")
        
        if not all(os.path.exists(p) for p in [model_path, words_path, classes_path, intents_path]):
            return jsonify({
                "response": "I'm not available right now. Please try again later.",
                "intent": "error",
                "confidence": 0.0,
                "model_type": f"{original_model_type}_fallback",
                "error": "Model files not found",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Load model and data
        chatbot_model = ChatbotModel()
        chatbot_model.load_model(project_id)
        
        with open(intents_path, 'r', encoding='utf-8') as f:
            intents_data = json.load(f)
        
        # Get prediction
        prediction = chatbot_model.predict(message)
        
        if prediction and "error" not in prediction:
            intent = prediction.get("intent", "unknown")
            confidence = prediction.get("confidence", 0.0)
            
            # Get response using response selector
            response = response_selector.get_response(intent, intents_data, message)
            
            return jsonify({
                "response": response,
                "intent": intent,
                "confidence": confidence,
                "model_type": f"{original_model_type}_fallback",
                "technology": "Neural Network (Fallback)",
                "timestamp": datetime.utcnow().isoformat()
            })
        else:
            return jsonify({
                "response": "I'm not sure how to respond to that.",
                "intent": "unknown",
                "confidence": 0.0,
                "model_type": f"{original_model_type}_fallback",
                "technology": "Neural Network (Fallback)",
                "timestamp": datetime.utcnow().isoformat()
            })
            
    except Exception as fallback_error:
        logger.error(f"Fallback chat error: {fallback_error}")
        return jsonify({
            "response": "I'm having trouble processing your request right now.",
            "intent": "error",
            "confidence": 0.0,
            "model_type": f"{original_model_type}_error",
            "error": str(fallback_error),
            "timestamp": datetime.utcnow().isoformat()
        })

# Model Comparison Endpoint
@model_chat_bp.route('/projects/<project_id>/chat/compare', methods=['POST'])
@token_required
def compare_models(current_user, project_id):
    """Compare responses from all available models"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Verify project ownership
        project = Project.query.filter_by(id=project_id, user_id=current_user["id"]).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        if project.training_status != "trained":
            return jsonify({"error": "Model not trained. Please train the model first."}), 400
        
        responses = {}
        
        # Try each model type
        for model_type in ["basic", "medium", "advanced"]:
            try:
                if model_type == "basic":
                    result = chat_with_basic_model(current_user, project_id)
                elif model_type == "medium":
                    result = chat_with_medium_model(current_user, project_id)
                else:  # advanced
                    result = chat_with_advanced_model(current_user, project_id)
                
                if result and hasattr(result, 'get_json'):
                    response_data = result.get_json()
                    responses[model_type] = response_data
                else:
                    responses[model_type] = {"error": "Failed to get response"}
                    
            except Exception as model_error:
                responses[model_type] = {"error": str(model_error)}
        
        return jsonify({
            "message": message,
            "project_id": project_id,
            "responses": responses,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Model comparison error: {e}")
        return jsonify({"error": f"Comparison failed: {str(e)}"}), 500