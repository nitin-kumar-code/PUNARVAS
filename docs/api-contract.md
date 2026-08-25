# API Contract

This document outlines the placeholder contracts for future PUNARVAS APIs. These are subject to change during active development.

## Endpoints

### Dashboard
- `GET /api/dashboard/summary`
  - Returns a high-level summary of habitations at risk, available sites, and active relocation plans.

### Habitations
- `GET /api/habitations`
  - Returns a list of all habitations, potentially paginated and filterable.
- `GET /api/habitations/{id}`
  - Returns detailed information about a specific habitation.
- `GET /api/habitations/{id}/risk`
  - Returns the latest AI-generated risk assessment for a specific habitation.

### Map Data
- `GET /api/map/habitations`
  - Returns GeoJSON data for all habitations to be rendered on the frontend map.
- `GET /api/map/sites`
  - Returns GeoJSON data for candidate relocation sites.
- `GET /api/map/risk-zones`
  - Returns GeoJSON data representing hazard-based red zones.

### Relocation & Decisions
- `POST /api/relocation/generate`
  - Triggers the optimization engine to generate a new relocation plan based on current risk assessments and candidate site carrying capacities.
- `GET /api/relocation/{id}/decision`
  - Retrieves a specific relocation decision receipt.
