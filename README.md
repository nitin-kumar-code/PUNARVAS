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

## Road Routing with OSRM (Relocation Engine Upgrade)

### Why Haversine Distance Was Insufficient
Previously, PUNARVAS calculated distances using the Haversine formula (straight-line distance). During an actual disaster (like a landslide or severe flood), straight-line distance is fundamentally flawed—a shelter that is 2km away over a mountain or across a river might take 3 hours to reach if there are no direct roads.

### Why Road Routing is Better for Disaster Relocation
Real road routing ensures our optimization solver (OR-Tools) factors in actual travel times and topographical constraints. This allows for realistic relocation planning that avoids sending people to geographically unreachable areas, preventing logistical bottlenecks during emergencies.

### How OSRM is Being Used
We integrated the **Open Source Routing Machine (OSRM)** via an internal `RoutingService` (`backend/app/services/routing_service.py`). When the backend optimization engine prepares candidate sites, it queries OSRM for the exact driving distance and estimated travel time between the vulnerable habitation and each candidate site. The engine caches these calculations to minimize API load during processing.

### What Happens When Routing Fails
Because networks fail during disasters, reliability is critical. If the OSRM service times out, is unavailable, or returns no valid route, our backend catches the error and gracefully falls back to the deterministic **Haversine Distance** calculation. The relocation planner will not crash; it will simply mark the routing status as `fallback_haversine`.

### How the Optimizer Uses Road Distance/Time
The objective function of the OR-Tools SCIP solver ranks candidate sites using a lexicographic approach. It maximizes total relocated population first, breaks ties using site safety scores, and finally uses the calculated **road distance** (instead of straight-line distance) to prefer the most efficiently accessible safe sites.
