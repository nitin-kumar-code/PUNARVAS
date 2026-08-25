# PUNARVAS

**Proactive Relocation Intelligence System**

## Problem Statement
SIH26191 — Intelligent Identification of Hazard-Based Red Zones, Carrying Capacity Assessment, and Immediate Relocation Needs for Vulnerable Habitations.

## Architecture
PUNARVAS is designed as a modular system:
- **Frontend**: React + Vite
- **Backend**: FastAPI (Python), SQLAlchemy 2.0, Pydantic v2
- **Database**: PostgreSQL (psycopg, Alembic)

## How to Start the Backend

### 1. Database Setup
You need a running PostgreSQL instance.
1. Create a database named `punarvas`.
2. Create a database named `punarvas_test` (for testing).

### 2. Environment Configuration
Navigate to the `backend` directory and set up your virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Ensure `DATABASE_URL` in `.env` points to your active PostgreSQL instance (e.g., `postgresql+psycopg://postgres:password@localhost:5432/punarvas`).

### 3. Run Database Migrations (Alembic)
Initialize the database schema:
```bash
alembic upgrade head
```

### 4. Seed the Database
Populate the database with realistic demo data (Habitations, Sites, Risk Assessments, etc.):
```bash
PYTHONPATH=. python -m app.db.seed
```

### 5. Start the API
```bash
uvicorn app.main:app --reload
```
- API URL: `http://localhost:8000`
- Swagger UI (Documentation & Testing): `http://localhost:8000/docs`

### 6. Run Tests
Tests are executed using `pytest` against the test database:
```bash
PYTHONPATH=. pytest
```
