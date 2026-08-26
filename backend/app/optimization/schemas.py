from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any
from enum import Enum
from uuid import UUID

class OptimizerStatus(str, Enum):
    FULLY_COVERED = "FULLY_COVERED"
    PARTIALLY_COVERED = "PARTIALLY_COVERED"
    INSUFFICIENT_CAPACITY = "INSUFFICIENT_CAPACITY"
    NO_SAFE_SITE = "NO_SAFE_SITE"
    INVALID_INPUT = "INVALID_INPUT"

class OptimizerHabitation(BaseModel):
    habitation_id: UUID
    population: int = Field(..., ge=0)
    vulnerable_population: int = Field(..., ge=0)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    risk_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    risk_level: Optional[str] = None
    primary_hazard: Optional[str] = None

    @model_validator(mode='after')
    def validate_population(self):
        if self.vulnerable_population > self.population:
            raise ValueError('vulnerable_population cannot exceed population')
        return self

class OptimizerCandidateSite(BaseModel):
    site_id: UUID
    name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    total_capacity: int = Field(..., ge=0)
    available_capacity: int = Field(..., ge=0)
    safety_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    accessibility_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    infrastructure_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    healthcare_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    community_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    hazard_exposure: Optional[float] = Field(None, ge=0.0, le=100.0)
    status: str

    @model_validator(mode='after')
    def validate_capacity(self):
        if self.available_capacity > self.total_capacity:
            raise ValueError('available_capacity cannot exceed total_capacity')
        return self

class OptimizerInput(BaseModel):
    source_habitation: OptimizerHabitation
    candidate_sites: List[OptimizerCandidateSite]

class OptimizerAllocation(BaseModel):
    site_id: UUID
    population: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0.0, le=100.0)
    distance_km: float = Field(..., ge=0.0)
    site_score: float = Field(..., ge=0.0, le=100.0)

class OptimizerRejectedSite(BaseModel):
    site_id: UUID
    reason: str
    hazard_exposure_info: Optional[Dict[str, Any]] = None

class OptimizerOutput(BaseModel):
    source_habitation_id: UUID
    source_population: int = Field(..., ge=0)
    vulnerable_population: int = Field(..., ge=0)
    allocated_population: int = Field(..., ge=0)
    uncovered_population: int = Field(..., ge=0)
    coverage_percentage: float = Field(..., ge=0.0, le=100.0)
    status: OptimizerStatus
    allocations: List[OptimizerAllocation]
    rejected_sites: List[OptimizerRejectedSite]

