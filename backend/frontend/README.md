# ChatBot Builder Frontend

A comprehensive React.js frontend application for building and managing AI chatbots. This application connects to a FastAPI backend to provide a complete chatbot development platform.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Project Management**: Create, edit, and delete chatbot projects
- **Intent Management**: Add, edit, and delete training intents
- **Model Training**: Train both basic and advanced AI models
- **Real-time Chat Testing**: Test your chatbots with an interactive chat interface
- **File Import**: Bulk import training data from various file formats
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: Real-time feedback for all user actions

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Toastify** for notifications
- **Lucide React** for icons
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- FastAPI backend running on port 8000

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatbot-builder-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API base URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Integration

This frontend is designed to work with the provided FastAPI backend. The main API endpoints used include:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Intents
- `GET /api/projects/{id}/intents` - Get project intents
- `POST /api/projects/{id}/intents` - Add new intent
- `PUT /api/projects/{id}/intents/{tag}` - Update intent
- `DELETE /api/projects/{id}/intents/{tag}` - Delete intent

### Training & Chat
- `POST /api/projects/{id}/train` - Train the model
- `POST /api/projects/{id}/chat` - Chat with the bot
- `POST /api/projects/{id}/import` - Import training data
- `GET /health` - System health check

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Projects.tsx    # Projects list
│   ├── ProjectDetail.tsx # Project management
│   ├── NewProject.tsx  # Create new project
│   └── Chat.tsx        # Chat interface
├── api/                # API integration
│   └── projects.ts     # API client functions
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
└── main.tsx           # App entry point
```

## Key Features Explained

### Dashboard
- Overview of all projects with statistics
- Quick access to create new projects
- System health monitoring
- Recent projects list with training status

### Project Management
- Create projects with different types (customer support, FAQ, etc.)
- Manage training intents with patterns and responses
- Train models with progress tracking
- Real-time status updates

### Intent Management
- Add multiple patterns for each intent
- Multiple response variations
- Bulk edit and delete operations
- Visual organization of training data

### Chat Interface
- Real-time conversation testing
- Confidence scores for responses
- Intent recognition display
- Message history with timestamps

### Authentication
- Secure JWT-based authentication
- Persistent login state
- Route protection
- User profile management

## Responsive Design

The application is fully responsive and includes:
- Mobile-first design approach
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces
- Optimized navigation for mobile devices

## Performance Features

- Lazy loading of components
- Optimized API calls with proper caching
- Debounced search functionality
- Efficient state management
- Fast build times with Vite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.