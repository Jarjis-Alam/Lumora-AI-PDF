# Lumora Backend

AI-powered document intelligence platform backend built with FastAPI, PostgreSQL/pgvector, and SQLAlchemy 2.0.

## Tech Stack
- **Framework**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL with pgvector extension
- **ORM**: SQLAlchemy 2.0 (Async)
- **Migrations**: Alembic
- **Testing**: Pytest & HTTPX

---

## Getting Started

### 1. Prerequisities
- Python 3.12 or newer
- PostgreSQL instance running (with pgvector installed)

### 2. Virtual Environment Setup
Inside the `backend/` directory, create and activate a virtual environment:

```bash
python -m venv .venv
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy the environment template and customize it:
```bash
cp .env.example .env
```

Ensure `DATABASE_URL` matches your local database settings. For async operations, the URL should use the `postgresql+asyncpg` driver scheme.

### 4. Running Migrations
Alembic migrations track the database schema. Run the migrations to bring your database schema up to date:
```bash
alembic upgrade head
```

### 5. Running the Application
Start the Uvicorn development server:
```bash
uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

## Testing
Run the automated test suite with pytest:
```bash
pytest tests/ -v
```
