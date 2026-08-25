# Database Schema

This document outlines the core entities and their relationships within the PUNARVAS PostgreSQL database. All tables inherit from a base model that includes `id` (UUID), `created_at`, and `updated_at`.

## Enums
The database uses several native PostgreSQL Enums:
- **RiskLevel**: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- **PriorityLevel**: `P1`, `P2`, `P3`
- **EvacuationStatus**: `PENDING`, `ROUTING`, `MONITORED`, `COMPLETED`
- **SiteStatus**: `ACTIVE`, `LIMITED`, `UNSAFE`, `FULL`
- **Recommendation**: `SAFE`, `RECOMMENDED`, `UNSAFE`, `REQUIRES_REVIEW`
- **RelocationStatus**: `DRAFT`, `READY_FOR_REVIEW`, `APPROVED`, `EXECUTED`

## Tables & Relationships

### `habitations`
Represents a vulnerable settlement or village.
- **Fields**: `name` (String), `state` (String), `district` (String), `block` (String), `latitude` (Float), `longitude` (Float), `total_population` (Int), `vulnerable_population` (Int), `households` (Int), `primary_hazard` (String), `risk_score` (Float), `priority_level` (Enum), `evacuation_status` (Enum)
- **Relationships**: 
  - `1:N` to `risk_assessments`
  - `1:N` to `relocation_plans`

### `risk_assessments`
Stores the risk evaluation (AI output) for a habitation over time.
- **Fields**: `habitation_id` (UUID, FK), `overall_score` (Float), `risk_level` (Enum), `hazard_type` (String), `hazard_exposure` (Float), `terrain_factor` (Float), `population_vulnerability` (Float), `infrastructure_vulnerability` (Float), `accessibility_factor` (Float), `historical_exposure` (Float), `confidence_score` (Float), `primary_driver` (String), `assessment_timestamp` (DateTime)

### `candidate_sites`
Represents a potential safe zone for relocation.
- **Fields**: `name` (String), `state` (String), `district` (String), `latitude` (Float), `longitude` (Float), `capacity_households` (Int), `capacity_people` (Int), `available_capacity` (Int), `water_availability` (Bool), `electricity_availability` (Bool), `healthcare_access` (Bool), `road_accessibility` (Bool), `shelter_availability` (Bool), `flood_risk` (Float), `landslide_risk` (Float), `earthquake_risk` (Float), `overall_safety_score` (Float), `status` (Enum)
- **Relationships**:
  - `1:N` to `site_assessments`
  - `1:N` to `allocations`

### `site_assessments`
Stores the evaluation of a candidate site's suitability over time.
- **Fields**: `site_id` (UUID, FK), `safety_score` (Float), `capacity_score` (Float), `accessibility_score` (Float), `infrastructure_score` (Float), `community_score` (Float), `overall_score` (Float), `recommendation` (Enum), `rejection_reason` (Text), `assessed_at` (DateTime)

### `relocation_plans`
A plan generated to relocate a specific habitation.
- **Fields**: `source_habitation_id` (UUID, FK), `total_population` (Int), `vulnerable_population` (Int), `status` (Enum), `total_travel_time` (Float), `coverage_percentage` (Float)
- **Relationships**:
  - `1:N` to `allocations`
  - `1:1` to `decision_receipts`

### `allocations`
Maps a portion of a relocation plan's population to a specific candidate site.
- **Fields**: `relocation_plan_id` (UUID, FK), `candidate_site_id` (UUID, FK), `population_allocated` (Int), `vulnerable_population_allocated` (Int), `travel_time_minutes` (Float), `allocation_percentage` (Float)

### `decision_receipts`
An immutable record of final relocation decisions, storing JSON evidence.
- **Fields**: `relocation_plan_id` (UUID, FK, Unique), `decision_type` (String), `decision_summary` (Text), `risk_score` (Float), `primary_reason` (Text), `evidence` (JSONB), `confidence_score` (Float), `generated_at` (DateTime)
