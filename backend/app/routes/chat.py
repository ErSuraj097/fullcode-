from flask import Blueprint, request, jsonify
from app.utils.security import token_required
from app.utils.data import load_projects, save_projects  # from app.utils.file_processing import save_uploaded_file
from werkzeug.utils import secure_filename

from chatbot_model.utils.response_selector import response_selector
from chatbot_model.models.transformer_models import(
    get_available_transformer_models,
    train_transformer_model,
    predict_with_transformer,
    get_transformer_status,
    check_model_requirements
)
from app.utils.default_chatbot import get_default_chatbot_config
from config import PROJECTS_DIR
from config import logger   
import os
import json
import torch
from app.utils.training_status_checker import check_and_update_training_status
from app.utils.feedback_storage import get_feedback_storage
from chatbot_model.utils.nltk_utils import tokenize, bag_of_words
from chatbot_model.models.model import ChatbotModel
from chatbot_model.models.advanced_model import AdvancedModelTrainer
from deep_translator import GoogleTranslator


chat_bp = Blueprint('chat', __name__)

def clean_message_text(message):
    """Clean message by removing excessive special characters while keeping meaningful content"""
    import re
    import unicodedata

    if not message:
        return ""
    message = re.sub(r'[^\w\s]{3,}', ' ', message)
    message = re.sub(r'(.)\1{3,}', r'\1\1', message)
    message = unicodedata.normalize('NFC', message)
    message = re.sub(r'\s+', ' ', message)
    message = message.strip()
    return message




# Automatically add domain to every response
@chat_bp.after_request
def add_domain_header(response):
    # client_domain = request.host  # detect incoming domain
    client_domain = "google.com"
    response.headers["X-Domain-Name"] = client_domain
    return response
# Chat Endpoint (Public for widget) - Enhanced Version
@chat_bp.route('/projects/<project_id>/chat', methods=['POST'])
def chat(project_id):
    try:
        
        # backend_hostname = "hello.com"  # server's hostname
        # response.headers["X-Backend-Host"] = backend_hostname
        
        data = request.get_json()
    
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
        
        # Load project and check training status
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id), None)
        
        if project:
            # Check and update training status based on actual model files
            projects = check_and_update_training_status(project_id, projects)
            save_projects(projects)
            # Reload the updated project
            project = next((p for p in projects if p["id"] == project_id), None)
        
        # Basic message preprocessing
        raw_message = data['message']
        lang = data.get('lang', 'en')

        if not raw_message or not raw_message.strip():
            return jsonify({"response": "Please enter a message.", "confidence": 0.0})
        
        # Basic length validation
        if len(raw_message) > 2000:
            return jsonify({"response": "Message too long. Please keep it under 2000 characters.", "confidence": 0.0})
        
        # Clean the message to remove meaningless symbols and characters
        message = clean_message_text(raw_message)

        # Check if message still has meaningful content after cleaning
        if not message or len(message.strip()) < 1:
            return jsonify({"response": "Please enter a meaningful message with letters or numbers.", "confidence": 0.0})

        # Handle feedback submission if provided
        if 'feedback' in data and data['feedback']:
            feedback_data = data['feedback']
            if isinstance(feedback_data, dict):
                feedback_data.update({
                    'user_message': raw_message,
                    'project_id': project_id,
                    'user_id': data.get('user_id', 'anonymous')
                })
                feedback_storage = get_feedback_storage(project_id)
                feedback_storage.store_feedback(feedback_data)
                logger.info(f"Feedback captured for project {project_id}")

        project_dir = os.path.join(PROJECTS_DIR, project_id)
        intents_file = os.path.join(project_dir, "intents.json")

        # Load chatbot config
        config_file = os.path.join(project_dir, "config.json")
        if os.path.exists(config_file):
            with open(config_file, "r", encoding="utf-8") as f:
                config = json.load(f)
        else:
            config = get_default_chatbot_config()

        # Get project info to determine model type
        if not project:
            return jsonify({
                "response": "Project not found.",
                "confidence": 0.0,
                "config": config
            })
        
        model_type = project.get("model_type", "basic")
        selected_model = project.get("selected_model", "medium")

        # Handle different training types: basic, medium, advanced
        # Each training type uses its corresponding model

        # Try transformer models first (if available)
        if model_type.startswith("transformer_"):
            transformer_type = model_type.replace("transformer_", "")
            try:
                # Translate input to English for better model processing
                try:
                    if lang != "en":
                        translated_input = GoogleTranslator(source=lang, target="en").translate(message)
                        logger.info(f"Translated input from {lang} to en: {message} -> {translated_input}")
                    else:
                        translated_input = message
                except Exception as e:
                    logger.warning(f"Input translation failed: {e}")
                    translated_input = message

                # Get prediction from transformer model
                prediction = predict_with_transformer(transformer_type, translated_input, project_id)

                if "error" not in prediction:
                    # Load intents to get proper responses
                    if os.path.exists(intents_file):
                        with open(intents_file, "r", encoding="utf-8") as f:
                            intents_data = json.load(f)

                        intent_tag = prediction["intent"]
                        confidence = prediction["confidence"]

                        # Use enhanced response selector
                        response_result = response_selector.select_best_response(
                            intent_tag, confidence, intents_data, message
                        )
                        response = response_result["response"]
                        confidence = response_result["confidence"]
                        intent_tag = response_result["intent"]
                    else:
                        response = prediction.get("response", "I'm not sure how to respond to that.")
                        confidence = prediction.get("confidence", 0.5)
                        intent_tag = prediction.get("intent", "unknown")

                    # Keep original response for accuracy, add optional translation
                    response_data = {
                        "response": response,
                        "confidence": confidence,
                        "intent": intent_tag,
                        "model_type": f"transformer_{transformer_type}",
                        "config": config
                    }

                    # Add dual-message fallback for low confidence responses
                    if confidence < 0.4:
                        contact_info = config.get("support_contact", "support@example.com")
                        fallback_messages = [
                            response,
                            f"If you need further assistance, please contact support at {contact_info}."
                        ]
                        response_data["response"] = fallback_messages

                    # Add optional translation if requested and different language
                    if lang != "en":
                        try:
                            translated = GoogleTranslator(source="en", target=lang).translate(response)
                            if translated and translated != response:
                                response_data["translated_response"] = translated
                                response_data["target_language"] = lang
                        except Exception as e:
                            logger.debug(f"Translation failed: {e}")

                    logger.info(f"Transformer {transformer_type} chat response for project {project_id}: {message} -> {response}")
                    return jsonify(response_data)
                else:
                    logger.warning(f"Transformer model failed: {prediction['error']}")

            except Exception as e:
                logger.warning(f"Transformer model failed for project {project_id}: {str(e)}")

        # Try medium model first (uses AdvancedChatbotModel)
        if model_type == "medium":
            try:
                from chatbot_model.models.advanced_model import AdvancedModelTrainer
                trainer = AdvancedModelTrainer()
                if trainer.load_model(project_id):

                    # Use original message for better accuracy
                    translated_input = message

                    # Get prediction from medium model
                    prediction = trainer.predict(translated_input)

                    if "error" not in prediction:
                        # Load intents for response
                        with open(intents_file, "r", encoding="utf-8") as file:
                            intents = json.load(file)

                        intent_tag = prediction["intent"]
                        confidence = prediction["confidence"]

                        if confidence > 0.5:  # Use enhanced response selector for better results
                            response_result = response_selector.select_best_response(
                                intent_tag, confidence, intents, translated_input
                            )
                            response = response_result["response"]
                            confidence = response_result["confidence"]
                            intent_tag = response_result["intent"]
                        else:
                            # Fall back to enhanced pattern matching
                            response_result = response_selector.pattern_match_fallback(
                                translated_input, intents
                            )
                            response = response_result["response"]
                            confidence = response_result["confidence"]
                            intent_tag = response_result["intent"]

                        # Keep original response for accuracy, add optional translation
                        response_data = {
                            "response": response,
                            "confidence": confidence,
                            "intent": intent_tag,
                            "model_type": "medium",
                            "config": config
                        }

                        # Add dual-message fallback for low confidence responses
                        if confidence < 0.4:
                            contact_info = config.get("support_contact", "support@example.com")
                            fallback_messages = [
                                response,
                                f"If you need further assistance, please contact support at {contact_info}."
                            ]
                            response_data["response"] = fallback_messages

                        # Add optional translation if requested and different language
                        if lang != "en":
                            try:
                                translated = GoogleTranslator(source="en", target=lang).translate(response)
                                if translated and translated != response:
                                    response_data["translated_response"] = translated
                                    response_data["target_language"] = lang
                            except Exception as e:
                                logger.debug(f"Translation failed: {e}")

                        logger.info(f"Medium chat response for project {project_id}: {message} -> {response}")
                        return jsonify(response_data)
            except Exception as e:
                logger.warning(f"Medium model failed for project {project_id}, falling back to basic: {str(e)}")

        # Try advanced model as fallback
        advanced_model_path = os.path.join(project_dir, "advanced_model.pth")
        if model_type == "advanced" and os.path.exists(advanced_model_path):
            try:
                trainer = AdvancedModelTrainer()
                if trainer.load_model(project_id):

                    # Use original message for better accuracy
                    translated_input = message

                    # Get prediction from advanced model
                    prediction = trainer.predict(translated_input)

                    if "error" not in prediction:
                        # Load intents for response
                        with open(intents_file, "r", encoding="utf-8") as file:
                            intents = json.load(file)

                        intent_tag = prediction["intent"]
                        confidence = prediction["confidence"]

                        if confidence > 0.5:  # Use enhanced response selector for better results
                            response_result = response_selector.select_best_response(
                                intent_tag, confidence, intents, translated_input
                            )
                            response = response_result["response"]
                            confidence = response_result["confidence"]
                            intent_tag = response_result["intent"]
                        else:
                            # Fall back to enhanced pattern matching
                            response_result = response_selector.pattern_match_fallback(
                                translated_input, intents
                            )
                            response = response_result["response"]
                            confidence = response_result["confidence"]
                            intent_tag = response_result["intent"]

                        # Keep original response for accuracy, add optional translation
                        response_data = {
                            "response": response,
                            "confidence": confidence,
                            "intent": intent_tag,
                            "model_type": "advanced",
                            "config": config
                        }

                        # Add dual-message fallback for low confidence responses
                        if confidence < 0.4:
                            contact_info = config.get("support_contact", "support@example.com")
                            fallback_messages = [
                                response,
                                f"If you need further assistance, please contact support at {contact_info}."
                            ]
                            response_data["response"] = fallback_messages

                        # Add optional translation if requested and different language
                        if lang != "en":
                            try:
                                translated = GoogleTranslator(source="en", target=lang).translate(response)
                                if translated and translated != response:
                                    response_data["translated_response"] = translated
                                    response_data["target_language"] = lang
                            except Exception as e:
                                logger.debug(f"Translation failed: {e}")

                        logger.info(f"Advanced chat response for project {project_id}: {message} -> {response}")
                        return jsonify(response_data)
            except Exception as e:
                logger.warning(f"Advanced model failed for project {project_id}, falling back to basic: {str(e)}")

        # Fallback to basic model
        data_file = os.path.join(project_dir, "data.pth")
        model_file = os.path.join(project_dir, "chatbot_model.pth")

        # If no trained models exist, provide a helpful fallback response
        if not os.path.exists(intents_file):
            return jsonify({
                "response": "I'm sorry, but I haven't been trained yet. Please add some intents and train the model first.", 
                "confidence": 0.0,
                "config": config
            })
        
        # If intents exist but no models, try to provide a simple pattern-based response
        if not all(os.path.exists(f) for f in [data_file, model_file]):
            try:
                with open(intents_file, "r", encoding="utf-8") as file:
                    intents = json.load(file)
                
                # Load uploaded content if available
                uploaded_content = {}
                content_file = os.path.join(project_dir, "uploaded_content.json")
                if os.path.exists(content_file):
                    try:
                        with open(content_file, "r", encoding="utf-8") as f:
                            uploaded_content = json.load(f)
                    except Exception as e:
                        logger.warning(f"Failed to load uploaded content: {e}")
                
                # Enhanced pattern matching with uploaded content
                if uploaded_content:
                    response_result = response_selector.match_with_uploaded_content(message, intents, uploaded_content)
                else:
                    response_result = response_selector.enhanced_tag_pattern_match(message, intents, project_id)
                
                response_data = {
                    "response": response_result["response"],
                    "confidence": response_result["confidence"],
                    "intent": response_result["intent"],
                    "model_type": "enhanced_pattern_matching",
                    "selection_method": response_result.get("selection_method", "unknown"),
                    "config": config
                }
                
                # Add source file info if matched from uploaded content
                if response_result.get("source_file"):
                    response_data["source_file"] = response_result["source_file"]
                    response_data["relevance_score"] = response_result.get("relevance_score", 0)
                
                # Add matched tags if available
                if response_result.get("matched_tags"):
                    response_data["matched_tags"] = response_result["matched_tags"]
                
                # Add optional translation if requested and different language
                if lang != "en":
                    try:
                        translated = GoogleTranslator(source="en", target=lang).translate(response_result["response"])
                        if translated and translated != response_result["response"]:
                            response_data["translated_response"] = translated
                            response_data["target_language"] = lang
                    except Exception as e:
                        logger.debug(f"Translation failed: {e}")
                
                return jsonify(response_data)
            except Exception as e:
                logger.error(f"Error in pattern matching fallback: {str(e)}")
                return jsonify({
                    "response": "I'm sorry, but I haven't been trained yet. Please make sure the model is trained first.", 
                    "confidence": 0.0,
                    "config": config
                })

        try:
            data = torch.load(data_file, map_location=torch.device('cpu'))
            model = ChatbotModel(data["input_size"], data["hidden_size"], data["output_size"])
            model.load_state_dict(torch.load(model_file, map_location=torch.device('cpu')))
            model.eval()

            with open(intents_file, "r", encoding="utf-8") as file:
                intents = json.load(file)

            # Use original message for better accuracy
            translated_input = message

            sentence = tokenize(translated_input)
            X = bag_of_words(sentence, data["all_words"])
            X = X.reshape(1, X.shape[0])
            X = torch.from_numpy(X).to(torch.float32)

            output = model(X)
            _, predicted = torch.max(output, dim=1)

            tag = data["tags"][predicted.item()]

            probs = torch.softmax(output, dim=1)
            prob = probs[0][predicted.item()]
            confidence = prob.item()

            if confidence > 0.4:  # Use enhanced response selector for better results
                response_result = response_selector.select_best_response(
                    tag, confidence, intents, translated_input
                )
                response = response_result["response"]
                confidence = response_result["confidence"]
                tag = response_result["intent"]
            else:
                # Load uploaded content if available
                uploaded_content = {}
                content_file = os.path.join(project_dir, "uploaded_content.json")
                if os.path.exists(content_file):
                    try:
                        with open(content_file, "r", encoding="utf-8") as f:
                            uploaded_content = json.load(f)
                    except Exception as e:
                        logger.warning(f"Failed to load uploaded content: {e}")
                
                # Fall back to enhanced pattern matching with uploaded content
                if uploaded_content:
                    response_result = response_selector.match_with_uploaded_content(
                        translated_input, intents, uploaded_content
                    )
                else:
                    response_result = response_selector.enhanced_tag_pattern_match(
                        translated_input, intents, project_id
                    )
                
                response = response_result["response"]
                confidence = response_result["confidence"]
                tag = response_result["intent"]

            # Keep original response for accuracy, add optional translation
            response_data = {
                "response": response,
                "confidence": confidence,
                "intent": tag,
                "model_type": "basic",
                "config": config
            }

            # Add dual-message fallback for low confidence responses
            if confidence < 0.4:
                contact_info = config.get("support_contact", "support@example.com")
                fallback_messages = [
                    response,
                    f"If you need further assistance, please contact support at {contact_info}."
                ]
                response_data["response"] = fallback_messages

            # Add optional translation if requested and different language
            if lang != "en":
                try:
                    translated = GoogleTranslator(source="en", target=lang).translate(response)
                    if translated and translated != response:
                        response_data["translated_response"] = translated
                        response_data["target_language"] = lang
                except Exception as e:
                    logger.debug(f"Translation failed: {e}")

            logger.info(f"Basic chat response for project {project_id}: {message} -> {response}")

            return jsonify(response_data)

        except Exception as e:
            logger.error(f"Error in basic chat for project {project_id}: {str(e)}")
            return jsonify({
                "response": "I'm sorry, I'm having trouble processing your request right now.",
                "confidence": 0.0,
                "config": config,
            
            })
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "response": "I'm sorry, something went wrong. Please try again later.",
            "confidence": 0.0
        })

# Feedback Endpoint for Adaptive Learning
@chat_bp.route('/projects/<project_id>/chat/feedback', methods=['POST'])
def submit_feedback(project_id):
    """Submit user feedback for adaptive learning"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Feedback data is required"}), 400

        required_fields = ['user_message', 'bot_response', 'feedback_type']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Validate project exists
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id), None)

        if not project:
            return jsonify({"error": "Project not found"}), 404

        # Store feedback
        feedback_storage = get_feedback_storage(project_id)
        success = feedback_storage.store_feedback(data)

        if success:
            return jsonify({"message": "Feedback submitted successfully"}), 200
        else:
            return jsonify({"error": "Failed to store feedback"}), 500

    except Exception as e:
        logger.error(f"Error submitting feedback for project {project_id}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@chat_bp.route('/chat/<project_id>')
def serve_chat_widget(project_id):
    """Serve a standalone chat page for the widget"""
    try:
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id), None)
        
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        config_file = os.path.join(PROJECTS_DIR, project_id, "config.json")
        if os.path.exists(config_file):
            with open(config_file, "r", encoding="utf-8") as f:
                config = json.load(f)
        else:
            config = get_default_chatbot_config()
        
        # Generate standalone chat page HTML
        chat_html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{config.get('bot_name', 'Chatbot')} - AI Assistant</title>
    <style>
        # body {{
        #     margin: 0;
        #     padding: 0;
        #     font-family: {config.get('font_family', 'Inter')}, sans-serif;
        #     background: #f8fafc;
        #     height: 100vh;
        #     display: flex;
        #     align-items: center;
        #     justify-content: center;
        # }}
        # .chat-container {{
        #     width: 100%;
        #     max-width: 400px;
        #     height: 600px;
        #     background: white;
        #     border-radius: 16px;
        #     box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        #     overflow: hidden;
        # }}
    </style>
</head>
<body>
    # <div class="chat-container" id="chat-container"></div>
    
    <script src="/static/widget.js"></script>
    <script>
        // Initialize widget in standalone mode
        const widget = ChatbotWidget.init({{
            projectId: '{project_id}',
            apiUrl: window.location.origin,
            autoOpen: true,
            position: 'center'
        }});
        
        // Override widget positioning for standalone mode
        document.addEventListener('DOMContentLoaded', function() {{
            const chatbotWidget = document.getElementById('chatbot-widget');
            if (chatbotWidget) {{
                chatbotWidget.style.position = 'static';
                chatbotWidget.style.width = '100%';
                chatbotWidget.style.height = '100%';
                document.getElementById('chat-container').appendChild(chatbotWidget);
                
                const chatbotWindow = document.getElementById('chatbot-window');
                if (chatbotWindow) {{
                    chatbotWindow.style.position = 'static';
                    chatbotWindow.style.width = '100%';
                    chatbotWindow.style.height = '100%';
                    chatbotWindow.classList.add('active');
                }}
            }}
        }});
    </script>
</body>
</html>"""
        
        return chat_html
        
    except Exception as e:
        logger.error(f"Error serving chat widget: {str(e)}")
        return jsonify({"error": "Failed to load chat widget"}), 500

