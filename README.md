# PUNARVAS

**Proactive Relocation Intelligence System**

## Problem Statement
SIH26191 — Intelligent Identification of Hazard-Based Red Zones, Carrying Capacity Assessment, and Immediate Relocation Needs for Vulnerable Habitations.

## Architecture
PUNARVAS is designed as a modular system:
- **Frontend**: React + Vite (TypeScript, Tailwind CSS, Leaflet)
- **Backend**: FastAPI (Python), SQLAlchemy 2.0, Pydantic v2
- **Database**: SQLite (Zero-config, highly portable for demos)
- **AI/ML**: Python (Pandas) rules-based scoring pipeline
- **Optimization Engine**: Google OR-Tools (Linear Programming)

## How to Start the Backend

### 1. Environment Configuration
Navigate to the `backend` directory and set up your virtual environment:
```bash
cd backend
python -m venv venv

# For Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# For Mac/Linux:
# source venv/bin/activate
pip install -r requirements.txt
echo "DATABASE_URL=sqlite:///./punarvas.db\nAPI_V1_PREFIX=/api/v1" > .env
```

### 2. Seed the Database
We use an auto-generating seeder to create the SQLite database `punarvas.db` and populate it with realistic demo data (Habitations, Sites, Risk Assessments).
```bash
PYTHONPATH=. python app/db/seed.py
```

### 3. Start the API
```bash
uvicorn app.main:app --reload
```
- API URL: `http://localhost:8000`
- Swagger UI (Documentation & Testing): `http://localhost:8000/docs`

### 4. Run Tests
Tests are executed using `pytest` against an in-memory SQLite database:
```bash
PYTHONPATH=. pytest
```
