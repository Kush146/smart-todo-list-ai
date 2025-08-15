# Smart Todo List with AI (Django REST + Next.js)

This is a full-stack starter for the assignment:
- **Backend:** Django/DRF + PostgreSQL + pluggable AI (OpenAI/Claude/LM Studio) with heuristic fallback.
- **Frontend:** Next.js (App Router) + Tailwind. Simple UI with Ask AI button.

## Quickstart
1. `docker compose up -d` (starts Postgres)
2. Backend:
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   python manage.py migrate
   python manage.py runserver
   ```
3. Frontend:
   ```bash
   cd ../frontend
   npm i
   cp .env.local.example .env.local
   npm run dev
   ```

Open http://localhost:3000

API docs: http://127.0.0.1:8000/api/docs/

## AI
- Set `AI_PROVIDER` to `none` (default), `lmstudio`, `openai`, or `anthropic` in `backend/.env`.
- For LM Studio: run the OpenAI-compatible server on `http://localhost:1234/v1` and set `OPENAI_*` vars accordingly.