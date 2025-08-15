# Backend Quickstart

```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

API docs: http://127.0.0.1:8000/api/docs/