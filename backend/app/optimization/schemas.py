from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import List, Optional
from enum import Enum
from uuid import UUID

class OptimizerStatus(str, Enum):
    FULLY_COVERED = "FULLY_COVERED"
    INSUFFICIENT_CAPACITY = "INSUFFICIENT_CAPACITY"
    NO_SAFE_SITE = "NO_SAFE_SITE"
    INVALID_INPUT = "INVALID_INPUT"

class OptimizerSiteStatus(str, Enum):
    ACTIVE = "ACTIVE"
    LIMITED = "LIMITED"
    FULL = "FULL"
    UNSAFE = "UNSAFE"
    UNAVAILABLE = "UNAVAILABLE"

class OptimizerHabitation(BaseModel):
    model_config = ConfigDict(frozen=True)

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
    model_config = ConfigDict(frozen=True)

    site_id: UUID
    name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    total_capacity: int = Field(..., ge=0)
    available_capacity: int = Field(..., ge=0)
    safety_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    accessibility_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    infrastructure_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    # Reserved for future optimization algorithms; presently fetched but not weighted in baseline
    healthcare_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    community_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    hazard_exposure: Optional[float] = Field(None, ge=0.0, le=100.0)
    status: OptimizerSiteStatus

    @model_validator(mode='after')
    def validate_capacity(self):
        if self.available_capacity > self.total_capacity:
            raise ValueError('available_capacity cannot exceed total_capacity')
        return self

class OptimizerInput(BaseModel):
    model_config = ConfigDict(frozen=True)

    source_habitation: OptimizerHabitation
    candidate_sites: List[OptimizerCandidateSite]

class OptimizerAllocation(BaseModel):
    model_config = ConfigDict(frozen=True)

    site_id: UUID
    population: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0.0, le=100.0)
    distance_km: float = Field(..., ge=0.0)
    site_score: float = Field(..., ge=0.0, le=100.0)

class HazardExposureInfo(BaseModel):
    model_config = ConfigDict(frozen=True)
    exposure: float

class OptimizerRejectedSite(BaseModel):
    model_config = ConfigDict(frozen=True)

    site_id: UUID
    reason: str
    hazard_exposure_info: Optional[HazardExposureInfo] = None

class OptimizerOutput(BaseModel):
    model_config = ConfigDict(frozen=True)

    source_habitation_id: UUID
    source_population: int = Field(..., ge=0)
    vulnerable_population: int = Field(..., ge=0)
    allocated_population: int = Field(..., ge=0)
    uncovered_population: int = Field(..., ge=0)
    coverage_percentage: float = Field(..., ge=0.0, le=100.0)
    status: OptimizerStatus
    allocations: List[OptimizerAllocation]
    rejected_sites: List[OptimizerRejectedSite]

    @model_validator(mode='after')
    def validate_output_invariants(self):
        if self.allocated_population + self.uncovered_population != self.source_population:
            raise ValueError("allocated_population + uncovered_population must equal source_population")
        
        if self.vulnerable_population > self.source_population:
            raise ValueError("vulnerable_population cannot exceed source_population")
            
        alloc_sum = sum(a.population for a in self.allocations)
        if alloc_sum != self.allocated_population:
            raise ValueError(f"Sum of allocation populations ({alloc_sum}) does not match allocated_population ({self.allocated_population})")
            
        # Ensure coverage percentage is mathematically consistent
        expected_coverage = round((self.allocated_population / self.source_population * 100.0), 2) if self.source_population > 0 else 100.0
        if abs(self.coverage_percentage - expected_coverage) > 0.01:
            raise ValueError(f"coverage_percentage ({self.coverage_percentage}) inconsistent with allocated/source population (expected ~{expected_coverage})")
            
        return self
