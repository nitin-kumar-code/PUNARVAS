from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from uuid import UUID

class RiskFeatures(BaseModel):
    hazard_exposure: float = Field(..., ge=0, le=100)
    terrain_factor: float = Field(..., ge=0, le=100)
    population_vulnerability: float = Field(..., ge=0, le=100)
    infrastructure_vulnerability: float = Field(..., ge=0, le=100)
    accessibility_factor: float = Field(..., ge=0, le=100)
    historical_exposure: float = Field(..., ge=0, le=100)

class RiskExplanation(BaseModel):
    factor: str
    value: float
    contribution: float
    severity: str

class RiskScoreResult(BaseModel):
    overall_score: float
    risk_level: str
    primary_driver: str
    confidence_score: float
    explanation: List[RiskExplanation]

class RiskAssessmentRequest(BaseModel):
    habitation_id: UUID
    features: RiskFeatures

class RiskAssessmentResponse(RiskScoreResult):
    habitation_id: UUID

class AllocationResult(BaseModel):
    site_id: UUID
    site_name: str
    population: int
    vulnerable_population: int
    allocation_percentage: float

class OptimizationResult(BaseModel):
    allocations: List[AllocationResult]
    rejected_sites: List[Dict[str, str]]
    coverage_percentage: float
    total_travel_time: float = 0.0

class RelocationRecommendationRequest(BaseModel):
    habitation_id: UUID

class RelocationRecommendationResponse(BaseModel):
    source_habitation: Dict
    candidate_sites: List[Dict]
    optimization_result: OptimizationResult

class DecisionGenerateRequest(BaseModel):
    habitation_id: UUID
    relocation_plan_id: Optional[UUID] = None
