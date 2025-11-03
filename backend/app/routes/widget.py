import logging
import os
import json
from flask import Blueprint, request, jsonify
from app.utils.security import token_required
from app.utils.data import load_projects, save_projects
from config import PROJECTS_DIR, logger
from app.utils.default_chatbot import get_default_chatbot_config

widget_bp = Blueprint('widget', __name__)

# # Widget demo endpoint - Basic configuration
# @widget_bp.route('/widget/<project_id>')
# def serve_widget_demo(project_id):
#     """Serve the widget demo page"""
#     try:
#         projects = load_projects()
#         project = next((p for p in projects if p["id"] == project_id), None)
#         if not project:
#             return jsonify({"error": "Project not found"}), 404
        
#         # Load widget configuration
#         widget_config_file = os.path.join(PROJECTS_DIR, project_id, "widget_config.json")
#         if os.path.exists(widget_config_file):
#             with open(widget_config_file, "r", encoding="utf-8") as f:
#                 widget_config = json.load(f)
#         else:
#             widget_config = {
#                 "bot_name": project.get("name", "Assistant"),
#                 "greeting_message": "Hello! How can I help you today?",
#                 "theme_color": "#3B82F6",
#                 "header_color": "#3B82F6",
#                 "user_bubble_color": "#3B82F6",
#                 "bot_bubble_color": "#F3F4F6",
#                 "text_color": "#374151",
#                 "agent_name": "Support Agent",
#                 "show_timestamps": True,
#                 "enable_typing_indicator": True,
#                 # Advanced settings
#                 "position": "bottom-right",
#                 "size": "medium",  # small, medium, large
#                 "auto_open": False,
#                 "auto_open_delay": 3000,
#                 "show_minimize_button": True,
#                 "show_close_button": True,
#                 "enable_sound": False,
#                 "max_messages": 50,
#                 "typing_delay": 1500,
#                 "show_agent_avatar": True,
#                 "agent_avatar_url": "",
#                 "custom_css": "",
#                 "language": "en"
#             }
        
#         # Generate widget HTML
#         bot_name = widget_config.get('bot_name', 'Chatbot')
#         header_color = widget_config.get('header_color', '#3B82F6')
#         bot_bubble_color = widget_config.get('bot_bubble_color', '#F3F4F6')
#         text_color = widget_config.get('text_color', '#374151')
#         user_bubble_color = widget_config.get('user_bubble_color', '#3B82F6')
#         theme_color = widget_config.get('theme_color', '#3B82F6')
#         agent_name = widget_config.get('agent_name', 'Support Agent')
#         greeting_message = widget_config.get('greeting_message', 'Hello! How can I help you today?')
#         show_timestamps = widget_config.get('show_timestamps', True)
#         enable_typing_indicator = widget_config.get('enable_typing_indicator', True)
        
#         timestamp_html = "<div class='timestamp'>Just now</div>" if show_timestamps else ""
#         timestamp_js = "'<div class=\"timestamp\">' + new Date().toLocaleTimeString() + '</div>'" if show_timestamps else "''"
#         typing_show = "showTypingIndicator();" if enable_typing_indicator else ""
#         typing_hide = "hideTypingIndicator();" if enable_typing_indicator else ""
#         typing_delay = "1500" if enable_typing_indicator else "500"
        
#         widget_html = f"""
# <!DOCTYPE html>
# <html lang="en">
# <head>
#     <meta charset="UTF-8">
#     <meta name="viewport" content="width=device-width, initial-scale=1.0">
#     <title>{bot_name} Widget</title>
#     <style>
#         * {{
#             margin: 0;
#             padding: 0;
           
#             box-sizing: none;
          
#           border: none;
#     position: absolute;
#     bottom: 0;
#     right: 0;
#     height: 685px;
#     width: 416px;

            

            
          
#         }}
#         body {{
#             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
#             background: red-500;
#             height: 100vh;
#             display: flex;
#             align-items: center;
#             justify-content: center;
#             border: none;
#             position: absolute;
#             bottom: 0;
#             right: 0;
           
#         }}
#         .widget-container {{
#             width: 400px;
#             height: 600px;
#             background: transparent;
#             border-radius: 0px;
#             box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
#             overflow: hidden;
#             display: flex;
#             flex-direction: column;
#         }}
#         .widget-header {{
#             background: {header_color};
#             color: white;
#             padding: 16px;
#             display: flex;
#             align-items: center;
#             gap: 12px;
#         }}
#         .agent-avatar {{
#             width: 40px;
#             height: 40px;
#             background: rgba(255, 255, 255, 0.2);
#             border-radius: 50%;
#             display: flex;
#             align-items: center;
#             justify-content: center;
#             font-size: 18px;
#         }}
#         .agent-info h3 {{
#             font-size: 16px;
#             font-weight: 600;
#         }}
#         .agent-info p {{
#             font-size: 12px;
#             opacity: 0.8;
#         }}
#         .messages-container {{
#             flex: 1;
#             padding: 16px;
#             overflow-y: auto;
#             display: flex;
#             flex-direction: column;
#             gap: 12px;
#         }}
#         .message {{
#             max-width: 80%;
#             padding: 12px 16px;
#             border-radius: 18px;
#             font-size: 14px;
#             line-height: 1.4;
#         }}
#         .bot-message {{
#             background: {bot_bubble_color};
#             color: {text_color};
#             align-self: flex-start;
#         }}
#         .user-message {{
#             background: {user_bubble_color};
#             color: white;
#             align-self: flex-end;
#         }}
#         .timestamp {{
#             font-size: 11px;
#             opacity: 0.6;
#             margin-top: 4px;
#         }}
#         .typing-indicator {{
#             display: flex;
#             align-items: center;
#             gap: 8px;
#             padding: 12px 16px;
#             color: #6b7280;
#             font-size: 12px;
#         }}
#         .typing-dots {{
#             display: flex;
#             gap: 2px;
#         }}
#         .typing-dot {{
#             width: 4px;
#             height: 4px;
#             background: #9ca3af;
#             border-radius: 50%;
#             animation: typing 1.4s infinite;
#         }}
#         .typing-dot:nth-child(2) {{ animation-delay: 0.2s; }}
#         .typing-dot:nth-child(3) {{ animation-delay: 0.4s; }}
#         @keyframes typing {{
#             0%, 60%, 100% {{ transform: translateY(0); }}
#             30% {{ transform: translateY(-10px); }}
#         }}
#         .input-container {{
#             padding: 16px;
#             border-top: 1px solid #e5e7eb;
#             display: flex;
#             gap: 8px;
#             align-items: center;
#         }}
#         .message-input {{
#             flex: 1;
#             padding: 12px 16px;
#             border: 1px solid #d1d5db;
#             border-radius: 24px;
#             outline: none;
#             font-size: 14px;
#         }}
#         .message-input:focus {{
#             border-color: {theme_color};
#         }}
#         .send-button {{
#             width: 40px;
#             height: 40px;
#             background: {theme_color};
#             color: white;
#             border: none;
#             border-radius: 50%;
#             cursor: pointer;
#             display: flex;
#             align-items: center;
#             justify-content: center;
#             transition: background-color 0.2s;
#         }}
#         .send-button:hover {{
#             background: {theme_color}dd;
#         }}
#     </style>
# </head>
# <body>
#     <div class="widget-container">
#         <div class="widget-header">
#             <div class="agent-avatar">🤖</div>
#             <div class="agent-info">
#                 <h3>{agent_name}</h3>
#                 <p>Online</p>
#             </div>
#         </div>
        
#         <div class="messages-container" id="messages">
#             <div class="message bot-message">
#                 {greeting_message}
#                 {timestamp_html}
#             </div>
#         </div>
        
#         <div class="input-container">
#             <input type="text" class="message-input" placeholder="Type your message..." id="messageInput">
#             <button class="send-button" onclick="sendMessage()">
#                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
#                     <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
#                 </svg>
#             </button>
#         </div>
#     </div>

#     <script>
#         const projectId = '{project_id}';
#         const messagesContainer = document.getElementById('messages');
#         const messageInput = document.getElementById('messageInput');
        
#         function addMessage(text, isUser = false) {{
#             const message = document.createElement('div');
#             message.className = `message ${{isUser ? 'user-message' : 'bot-message'}}`;
#             message.innerHTML = text + {timestamp_js};
#             messagesContainer.appendChild(message);
#             messagesContainer.scrollTop = messagesContainer.scrollHeight;
#         }}
        
#         function showTypingIndicator() {{
#             const typing = document.createElement('div');
#             typing.className = 'typing-indicator';
#             typing.id = 'typing';
#             typing.innerHTML = `
#                 <div class="typing-dots">
#                     <div class="typing-dot"></div>
#                     <div class="typing-dot"></div>
#                     <div class="typing-dot"></div>
#                 </div>
#                 {agent_name} is typing...
#             `;
#             messagesContainer.appendChild(typing);
#             messagesContainer.scrollTop = messagesContainer.scrollHeight;
#         }}
        
#         function hideTypingIndicator() {{
#             const typing = document.getElementById('typing');
#             if (typing) typing.remove();
#         }}
        
#         async function sendMessage() {{
#             const text = messageInput.value.trim();
#             if (!text) return;
            
#             addMessage(text, true);
#             messageInput.value = '';
            
#             {typing_show}
            
#             try {{
#                 const response = await fetch(`/api/projects/${{projectId}}/chat`, {{
#                     method: 'POST',
#                     headers: {{
#                         'Content-Type': 'application/json',
#                     }},
#                     body: JSON.stringify({{ message: text, lang: 'en' }})
#                 }});
                
#                 const data = await response.json();
                
#                 setTimeout(() => {{
#                     {typing_hide}
#                     addMessage(data.translated_response || data.response || 'Sorry, I could not understand that.');
#                 }}, {typing_delay});
                
#             }} catch (error) {{
#                 {typing_hide}
#                 addMessage('Sorry, there was an error processing your message.');
#             }}
#         }}
        
#         messageInput.addEventListener('keypress', function(e) {{
#             if (e.key === 'Enter') {{
#                 sendMessage();
#             }}
#         }});
#     </script>
# </body>
# </html>
#         """
        
#         return widget_html
#     except Exception as e:
#         logger.error(f"Error serving widget demo: {e}")
#         return jsonify({"error": "Failed to serve widget demo"}), 500



# Widget Endpoints
@widget_bp.route('/projects/<project_id>/widget/config')
@token_required
def get_widget_config(current_user, project_id):
    """Get widget configuration"""
    try:
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        widget_config_file = os.path.join(PROJECTS_DIR, project_id, "widget_config.json")
        if os.path.exists(widget_config_file):
            with open(widget_config_file, "r", encoding="utf-8") as f:
                widget_config = json.load(f)
        else:
            widget_config = {
                "bot_name": project.get("name", "Assistant"),
                "greeting_meesage": project.get("greeting_message", "Hi there! I'm here to assist you. How can I help?"),
                "agent_name": project.get("agent_name", "Support Agent"),
                "agent_avatar_url": project.get("avatar", ""),
                "agent_description": project.get("agent_description", "Your friendly support assistant."),
                "background_color": project.get("background_color", "#FFFFFF"),
                "background_value": project.get("background_value", "rgba(255, 255, 255, 0.8)"),
                "font_family": project.get("font_family", "Arial, sans-serif"),
                "font_size": project.get("font_size", 14),
                "border_radius": project.get("border_radius", 16),
                "shadow": project.get("shadow", "0 10px 30px rgba(0, 0, 0, 0.1)"),
                "theme_color": project.get("theme_color", "#000000"),
                "header_color": project.get("theme_color", "#000000"),
                "user_bubble_color": project.get("theme_color", "#000000"),
                "auto_open": project.get("auto_open", False),
                "auto_open_delay": project.get("auto_open_delay", 3000),
                "show_minimize_button": project.get("show_minimize_button", True),
                "enable_sound": project.get("enable_sound", False),
                "enable_typing_indicator": project.get("enable_typing_indicator", True),
                "bot_bubble_color": project.get("bot_bubble_color", "#F3F4F6"),
                "text_color": project.get("text_color", "#000000"),
                "agent_name": "project.get('agent_name', 'Support Agent')",
                "show_timestamps": project.get("show_timestamps", True),
                "enable_typing_indicator": project.get("enable_typing_indicator", True),
                "position": project.get("position", "bottom-right"),
                "width": project.get("width", 400),
                "height": project.get("height", 600),
                "border_radius": project.get("border_radius", 16),
                "shadow": project.get("shadow", "0 10px 30px rgba(0, 0, 0, 0.1)"),
                "avatar_url": project.get("avatar", ""),
                "custom_css": project.get("custom_css", ""),
                "language_selector": project.get("language_selector", False),
                 "show_timestamps": project.get("show_timestamps", True),
                "show_branding": project.get("show_branding", False),
                "typing_delay": project.get("typing_delay", 1500),
                "language": project.get("language", "en"),
                "custom_css": project.get("custom_css", ""),
                "welcome_delay": project.get("welcome_delay", 1000),
                "supported_languages": project.get("supported_languages", [
                   {"code": "hi",  "name": "हिन्दी"},
                    {"code": "as",  "name": "অসমীয়া"},
                    {"code": "bn",  "name": "বাংলা"},
                    {"code": "brx", "name": "बोड़ो"},
                    {"code": "doi","name": "डोगरी"},
                    {"code": "gu",  "name": "ગુજરાતી"},
                    {"code": "kn",  "name": "ಕನ್ನಡ"},
                    {"code": "ks",  "name": "کٲشُر"},
                    {"code": "kok","name": "कोंकणी"},
                    {"code": "mai","name": "मैथिली"},
                    {"code": "ml",  "name": "മലയാളം"},
                    {"code": "mni","name": "মৈতৈলোন্"},
                    {"code": "mr",  "name": "मराठी"},
                    {"code": "ne",  "name": "नेपाली"},
                    {"code": "or",  "name": "ଓଡ଼ିଆ"},
                    {"code": "pa",  "name": "ਪੰਜਾਬੀ"},
                    {"code": "sa",  "name": "संस्कृतम्"},
                    {"code": "sd",  "name": "سنڌي"},
                    {"code": "ta",  "name": "தமிழ்"},
                    {"code": "te",  "name": "తెలుగు"},
                    {"code": "ur",  "name": "اردو"}
                ])
            }
        
        return jsonify(widget_config)
        
    except Exception as e:
        logger.error(f"Error getting widget config for project {project_id}: {e}")
        return jsonify({"error": "Failed to get widget configuration"}), 500

@widget_bp.route('/projects/<project_id>/widget/config', methods=['PUT'])
@token_required
def update_widget_config(current_user, project_id):
    """Update widget configuration"""
    try:
        data = request.get_json()
        
        # Verify project ownership
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Save widget configuration
        widget_config_file = os.path.join(PROJECTS_DIR, project_id, "widget_config.json")
        os.makedirs(os.path.dirname(widget_config_file), exist_ok=True)
        
        with open(widget_config_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        logger.info(f"Updated widget config for project {project_id}")
        return jsonify(data)
        
    except Exception as e:
        logger.error(f"Error updating widget config for project {project_id}: {e}")
        return jsonify({"error": "Failed to update widget configuration"}), 500

# Public Widget Config Endpoint (No auth required)
@widget_bp.route('/widget/<project_id>/config')
def get_widget_config_public(project_id):
    """Get widget configuration (public endpoint)"""
    try:
        # Load project to verify it exists
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id), None)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Load widget configuration
        widget_config_file = os.path.join(PROJECTS_DIR, project_id, "widget_config.json")
        if os.path.exists(widget_config_file):
            with open(widget_config_file, "r", encoding="utf-8") as f:
                widget_config = json.load(f)
        else:
            # Default widget configuration
           widget_config = {
    "bot_name": project.get("bot_name", "Assistant"),
    "greeting_message": project.get("greeting_message",
                                    "Hi there! I'm here to assist you. How can I help?"),
    "agent_name": project.get("agent_name", "Support Agent"),
    "agent_title": project.get("agent_title", "AI"),
    "agent_avatar": project.get("agent_avatar", ""),
    "agent_description": project.get("agent_description", "Your friendly support assistant."),
    "background_color": project.get("background_color", "#FFFFFF"),
    "background_type": project.get("background_type", "color"),
    "background_value": project.get("background_value", "rgba(255, 255, 255, 0.8)"),
    "font_family": project.get("font_family", "Arial, sans-serif"),
    "font_size": project.get("font_size", 14),
    "border_radius": project.get("border_radius", 16),
    "shadow": project.get("shadow", "0 10px 30px rgba(0, 0, 0, 0.1)"),
    "theme_color": project.get("theme_color", "#000000"),
    "header_color": project.get("header_color", "#000000"),
    "user_bubble_color": project.get("user_bubble_color", "#000000"),
    "bot_bubble_color": project.get("bot_bubble_color", "#F3F4F6"),
    "bubble_style": project.get("bubble_style", "rounded"),
    "auto_open": project.get("auto_open", False),
    "auto_open_delay": project.get("auto_open_delay", 3000),
    "show_minimize_button": project.get("show_minimize_button", True),
    "enable_sound": project.get("enable_sound", True),
    "enable_typing_indicator": project.get("enable_typing_indicator", True),
    "show_timestamps": project.get("show_timestamps", True),
    "show_branding": project.get("show_branding", True),
    "typing_delay": project.get("typing_delay", 1500),
    "language": project.get("language", "en"),
    "custom_css": project.get("custom_css", ""),
    "welcome_delay": project.get("welcome_delay", 2000),
    "session_timeout": project.get("session_timeout", 1800),
    "max_messages": project.get("max_messages", 100),
    "position": project.get("position", "bottom-right"),
    "width": project.get("width", 400),
    "height": project.get("height", 600),
    "avatar_url": project.get("avatar", ""),
    "language_selector": project.get("language_selector", False),
    "supported_languages": project.get("supported_languages", [
        {"code": "hi",  "name": "हिन्दी"},
        {"code": "as",  "name": "অসমীয়া"},
        {"code": "bn",  "name": "বাংলা"},
        {"code": "brx", "name": "बोड़ो"},
        {"code": "doi","name": "डोगरी"},
        {"code": "gu",  "name": "ગુજરાતી"},
        {"code": "kn",  "name": "ಕನ್ನಡ"},
        {"code": "ks",  "name": "کٲشُر"},
        {"code": "kok","name": "कोंकणी"},
        {"code": "mai","name": "मैथिली"},
        {"code": "ml",  "name": "മലയാളം"},
        {"code": "mni","name": "মৈতৈলোন্"},
        {"code": "mr",  "name": "मराठी"},
        {"code": "ne",  "name": "नेपाली"},
        {"code": "or",  "name": "ଓଡ଼ିଆ"},
        {"code": "pa",  "name": "ਪੰਜਾਬੀ"},
        {"code": "sa",  "name": "संस्कृतम्"},
        {"code": "sd",  "name": "سنڌي"},
        {"code": "ta",  "name": "தமிழ்"},
        {"code": "te",  "name": "తెలుగు"},
        {"code": "ur",  "name": "اردو"}
    ])
}

        
        return jsonify(widget_config)
        
    except Exception as e:
        logger.error(f"Error getting public widget config for project {project_id}: {e}")
        return jsonify({"error": "Failed to get widget configuration"}), 500

@widget_bp.route('/projects/<project_id>/widget/embed', methods=['POST'])
@token_required
def generate_widget_embed_code(current_user, project_id):
    """Generate embed code with custom configuration"""
    try:
        data = request.get_json()
        
        # Verify project ownership
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        base_url = request.host_url.rstrip('/') 
        # base_url = 'http://13.204.80.131:8000/'
        
        embed_code = f"""<script src="{base_url}/static/widget.js"></script>
<script>
    ChatbotWidget.init({{
        projectId: '{project_id}',
        apiUrl: '{base_url}',
        ...{json.dumps(data)}
    }});
</script>"""
        
        multilingual_embed_code = f"""
<!-- Multilingual Chat Widget -->
<script>
window.MULTILINGUAL_WIDGET_CONFIG = {{
    projectId: '{project_id}',
    apiUrl: '{base_url}',
    ...{json.dumps(data)}
}};
</script>
<script src="{base_url}/widget/multilingual-widget.js"></script>
        """
        
        embed_response = {
            "html": f'<div id="multilingual-chat-widget-{project_id}"></div>',
            "javascript": multilingual_embed_code,
            "css": f"""/* Multilingual Chat Widget Container */
#multilingual-chat-widget-{project_id} {{
    /* Widget styles are handled internally */
}}""",
            "iframe_url": f"{base_url}/widget/{project_id}",
            "embed_code": multilingual_embed_code,
            "direct_link": f"{base_url}/widget/{project_id}",
            "config": data
        }
        
        return jsonify(embed_response)
    except Exception as e:
        logger.error(f"Error generating embed code: {str(e)}")
        return jsonify({"error": "Failed to generate embed code"}), 500

#icon upload endpoint
@widget_bp.route('/projects/<project_id>/widget/upload-icon', methods=['POST'])
@token_required
def upload_widget_icon(current_user, project_id):
    """Upload widget icon/avatar"""
    try:
        # Verify project ownership
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id and p["user_id"] == current_user["id"]), None)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        if 'icon' not in request.files:
            return jsonify({"error": "No icon file uploaded"}), 400
        
        icon = request.files['icon']
        if icon.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Validate file type
        if not icon.content_type or not icon.content_type.startswith('image/'):
            return jsonify({"error": "File must be an image"}), 400
        
        # Create uploads directory
        uploads_dir = os.path.join(PROJECTS_DIR, project_id, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Save file
        file_extension = os.path.splitext(icon.filename)[1] if icon.filename else '.png'
        filename = f"avatar{file_extension}"
        file_path = os.path.join(uploads_dir, filename)
        
        icon.save(file_path)
        
        # Update config with new avatar path
        config_file = os.path.join(PROJECTS_DIR, project_id, "config.json")
        if os.path.exists(config_file):
            with open(config_file, "r", encoding="utf-8") as f:
                config = json.load(f)
        else:
            config = get_default_chatbot_config()
        
        config['avatar'] = f"/api/projects/{project_id}/uploads/{filename}"
        
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(config, f, ensure_ascii=False, indent=4)
        
        logger.info(f"Uploaded widget icon for project {project_id}")
        return jsonify({"message": "Icon uploaded successfully", "avatar_url": config['avatar']})
        
    except Exception as e:
        logger.error(f"Error uploading widget icon: {str(e)}")
        return jsonify({"error": "Failed to upload icon"}), 500

# Public Widget Info Endpoint (No auth required)
@widget_bp.route('/widget/<project_id>/info')
def get_widget_info(project_id):
    """Get basic project info for widget (public endpoint)"""
    try:
        projects = load_projects()
        project = next((p for p in projects if p["id"] == project_id), None)
        
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Return only public info needed for widget
        return jsonify({
            "id": project["id"],
            "name": project["name"],
            "type": project.get("type", "general"),
            "training_status": project.get("training_status", "not_trained"),
            "is_trained": project.get("training_status") == "trained"
        })
    except Exception as e:
        logger.error(f"Error getting widget info: {str(e)}")
        return jsonify({"error": "Failed to get widget info"}), 500