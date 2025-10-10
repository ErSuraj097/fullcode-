from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from datetime import datetime
from app.models import db
from config import logger, DATABASE_URI
from config import (    
    SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, 
    PROJECTS_DIR, USERS_DIR, PROJECTS_FILE, USERS_FILE
)

from app.routes.auth import auth_bp
from app.routes.chat import chat_bp
from app.routes.chatbot import chatbot_bp
from app.routes.contact import contact_bp
from app.routes.dashboard import dashboard_bp
from app.routes.intent import intent_bp
from app.routes.model import model_bp
from app.routes.project import project_bp
from app.routes.training import training_bp
from app.routes.widget import widget_bp 
from app.routes.starter import starter_bp
from app.routes.model_training import model_training_bp
from app.routes.model_chat import model_chat_bp





def serve_widget_demo(project_id):
    """Serve the widget demo HTML file"""
    try:
        demo_file_path = os.path.join("static", "widget_demo.html")
        if os.path.exists(demo_file_path):
            return send_file(demo_file_path)
        else:
            logger.error(f"Widget demo file not found: {demo_file_path}")
            return jsonify({"error": "Widget demo file not found"}), 404
    except Exception as e:
        logger.error(f"Error serving widget demo: {e}")
        return jsonify({"error": "Failed to serve widget demo"}), 500

def create_app():
    app = Flask(__name__)
  
    # Set configuration
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize database
    db.init_app(app)

    CORS(app, origins=["*"], supports_credentials=True)

    app.register_blueprint(starter_bp, url_prefix='/')
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    app.register_blueprint(chat_bp, url_prefix='/api/v1')

    app.register_blueprint(chatbot_bp, url_prefix='/api/v1/')
    app.register_blueprint(contact_bp, url_prefix='/api/v1')

    app.register_blueprint(dashboard_bp, url_prefix='/api/v1')
    app.register_blueprint(intent_bp, url_prefix='/api/v1')
    app.register_blueprint(model_bp, url_prefix='/api/v1')
    app.register_blueprint(project_bp, url_prefix='/api/v1')


    app.register_blueprint(training_bp, url_prefix='/api/v1')
    app.register_blueprint(widget_bp, url_prefix='/api/v1')
    
    # Enhanced model training and chat routes
    app.register_blueprint(model_training_bp, url_prefix='/api/v1')
    app.register_blueprint(model_chat_bp, url_prefix='/api/v1')
    
    # New professional features

    
    return app



if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=8000)