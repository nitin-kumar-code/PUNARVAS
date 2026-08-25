# PUNARVAS

**Proactive Relocation Intelligence System**

## Problem Statement
SIH26191 — Intelligent Identification of Hazard-Based Red Zones, Carrying Capacity Assessment, and Immediate Relocation Needs for Vulnerable Habitations.

## Architecture
PUNARVAS is designed as a modular system with clear separation of concerns:
- **Frontend**: React + Vite (Tailwind CSS for styling, Leaflet for maps)
- **Backend**: FastAPI (Python) serving as the integration layer and REST API
- **Database**: PostgreSQL (managed via SQLAlchemy ORM)
- **AI/ML Engine**: Python-based risk assessment module (pandas, scikit-learn)
- **Optimization Engine**: Relocation planning using Google OR-Tools

## Technology Stack
- Backend: Python 3.10+, FastAPI, SQLAlchemy, Pydantic, Uvicorn
- Database: PostgreSQL, psycopg
- Frontend: React, Vite, Tailwind CSS, Leaflet
- AI/ML: Python, pandas, scikit-learn
- Optimization: Google OR-Tools

## Repository Structure
```
punarvas/
├── backend/       # FastAPI application, database models, and core logic
├── frontend/      # React application (UI/UX)
├── ai-ml/         # Machine learning models, data preprocessing, and risk engine
├── optimization/  # OR-Tools relocation logic and constraints
└── docs/          # Architecture, API contracts, and database schema documentation
```

## How to Start the Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment and activate it:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Copy `.env.example` to `.env` and update the values, specifically the `DATABASE_URL`.
   ```bash
   cp .env.example .env
   ```

5. **Start the server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

## How to Configure PostgreSQL
1. Install PostgreSQL and start the service.
2. Create a database named `punarvas`.
3. Update the `DATABASE_URL` in the `backend/.env` file with your PostgreSQL credentials. Example: `postgresql+psycopg://username:password@localhost:5432/punarvas`

## How to Run Tests
From the `backend` directory, run:
```bash
pytest
```

## Module Communication
- The **Frontend** communicates with the Backend via RESTful API calls over HTTP/JSON.
- The **AI/ML** and **Optimization** modules are developed as independent Python packages/scripts. The Backend will import and execute these modules or communicate with them as separate services depending on scaling needs.
