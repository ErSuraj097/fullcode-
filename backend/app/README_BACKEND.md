# Chatbot Flask API - Backend Documentation

## Overview
This backend service is a Flask-based API for managing chatbot projects, training models, handling chat interactions, and collecting user feedback for adaptive learning.

## Key Features
- starter  - health, "/" , spa demo
- Authentication : Loging and Registration
- Chatbot configure : Cofiguration of chatbot update and delete and edit
- Project management: Create, update, delete chatbot projects.
- Intent management: Upload and manage intents for chatbot training.
- All Model and selective : select model and model
- Model training: Support for multiple model types including basic, advanced, and transformer models.
- Chat endpoint: Process user messages and generate chatbot responses.
- Widget: Widget Configuration and modification 
- Feedback collection: Store user feedback for improving chatbot accuracy and performance.
- Dashboard analytics: Provide statistics and insights on chatbot usage and feedback.

## API Endpoints
### Auth 
- `POST /api/v1/auth`
    - Registration : `{"name": "John Doe", "email": "john1@example.com",  "password": "password123"}`
    - Login : `{ "email": "john1@example.com",  "password": "password123"}`


### Chat
- `POST /api/v1/projects/<project_id>/chat`
  - Send a chat message to the chatbot.
  - Request JSON: `{ "message": "text", "lang": "en", "feedback": {...} }`
  - Response: Chatbot reply with confidence and optional translation.

- `POST /api/v1/projects/<project_id>/chat/feedback`
  - Submit user feedback for adaptive learning.
  - Request JSON must include:
    - `user_message`: Original user message.
    - `bot_response`: Chatbot's response.
    - `feedback_type`: Type of feedback (e.g., positive, negative, correction).
  - Response: Success or error message.

### Projects
- CRUD operations for chatbot projects.

### Intents
- Upload and manage intents for training.

### Training
- Trigger training for different model types.

### Dashboard
- Retrieve analytics and feedback statistics.

## Feedback Storage
- Feedback is stored persistently in JSON files under each project's directory.
- Feedback includes user message, bot response, feedback type, rating, corrections, timestamp, and detected intent.
- Feedback can be retrieved and analyzed for improving chatbot models.

## Running the Backend
- Requires Python 3.8+
- Install dependencies from `requirements.txt`.
- Run the app with:
  ```
  python main.py
  ```
- The API will be available at `http://localhost:8000/api/v1/`.

## Configuration
- Configuration variables are set in `config.py`.
- Key settings include project directories, secret keys, and model parameters.

## Logging
- Uses Python logging for info, warning, and error messages.
- Logs are helpful for debugging and monitoring.

## Notes
- CORS is enabled for all origins.
- Swagger UI is available at `/docs/` for API exploration.

## Contact
For issues or contributions, please contact the development team.
