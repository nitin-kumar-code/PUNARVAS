# API Contract

This document outlines the implemented endpoints for the PUNARVAS backend.

## Base CRUD Endpoints

All entities (`/api/habitations`, `/api/sites`, `/api/relocation-plans`, `/api/decisions`) support standard REST operations:
- `GET /` -> List all
- `GET /{id}` -> Get by ID
- `POST /` -> Create new
- `PUT /{id}` -> Update existing (for habitations and sites)
- `DELETE /{id}` -> Delete existing (for habitations and sites)

### Special Nested Endpoints
- `GET /api/habitations/{id}/risk` -> Retrieves the latest risk assessment for a habitation.
- `GET /api/risks/{id}` -> Retrieves a specific risk assessment by ID.
- `GET /api/sites/{id}/assessment` -> Retrieves the latest site assessment for a candidate site.
- `POST /api/sites/{id}/assessment` -> Submits a new site assessment.
- `GET /api/relocation-plans/{id}/allocations` -> Retrieves all allocations for a plan.
- `POST /api/relocation-plans/{id}/allocations` -> Creates a new allocation.

## Dashboard Endpoints

### `GET /api/dashboard/summary`
Returns high-level aggregation of current data.
```json
{
  "total_habitations": 10,
  "critical_habitations": 2,
  "immediate_relocation": 2450,
  "vulnerable_population": 3050,
  "safe_relocation_capacity": 14250,
  "risk_distribution": {
      "critical": 2,
      "high": 3,
      "medium": 2,
      "low": 3
  },
  "priority_habitations": [
    {
      "id": "uuid-string",
      "name": "Village A",
      "population": 450,
      "risk_score": 98.5
    }
  ]
}
```

## Map Endpoints

### `GET /api/map/habitations`
```json
[
  {
    "id": "uuid-string",
    "name": "Village A",
    "latitude": 26.95,
    "longitude": 94.16,
    "risk_score": 98.5,
    "risk_level": "CRITICAL",
    "population": 450,
    "vulnerable_population": 120
  }
]
```

### `GET /api/map/sites`
```json
[
  {
    "id": "uuid-string",
    "name": "Site A",
    "latitude": 26.75,
    "longitude": 94.20,
    "available_capacity": 2500,
    "status": "ACTIVE",
    "overall_safety_score": 90.0
  }
]
```

### `GET /api/map/risk-zones`
Returns points representing critical hazard zones.
```json
[
  {
    "id": "uuid-string",
    "habitation_id": "uuid-string",
    "latitude": 26.95,
    "longitude": 94.16,
    "hazard_type": "Flood",
    "intensity": 98.5
  }
]
```
