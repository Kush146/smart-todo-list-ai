# Smart Todo List with AI (Django REST + Next.js)

# Smart Todo List with AI

## Overview
This is a Smart Todo List application with AI features like task prioritization, deadline suggestions, and context-aware recommendations. The system uses daily context from messages, emails, and notes to provide intelligent task management suggestions.

## Setup Instructions

### Frontend (Next.js)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js app:
   ```bash
   npm run dev
   ```

### Backend (Django)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Django server:
   ```bash
   python manage.py runserver
   ```

## API Documentation
- **GET /api/tasks/**: Fetch all tasks
- **POST /api/tasks/**: Create a new task
- **GET /api/categories/**: Get task categories
- **POST /api/ai/suggest/**: Get AI suggestions for tasks

## Sample Tasks & AI Suggestions
Example task: "Complete project proposal"
AI suggestions: Prioritize as high, Deadline suggestions: August 20, 2025, 5:00 PM, etc.
