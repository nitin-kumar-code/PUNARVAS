from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.enums import RiskLevel

class RiskAssessmentBase(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=100.0)
    risk_level: RiskLevel
    
    hazard_type: str = Field(..., min_length=1)
    hazard_exposure: float = Field(..., ge=0.0, le=100.0)
    terrain_factor: float = Field(..., ge=0.0, le=100.0)
    population_vulnerability: float = Field(..., ge=0.0, le=100.0)
    infrastructure_vulnerability: float = Field(..., ge=0.0, le=100.0)
    accessibility_factor: float = Field(..., ge=0.0, le=100.0)
    historical_exposure: float = Field(..., ge=0.0, le=100.0)
    
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    primary_driver: Optional[str] = None

class RiskAssessmentCreate(RiskAssessmentBase):
    pass

class RiskAssessmentUpdate(RiskAssessmentBase):
    overall_score: Optional[float] = None
    risk_level: Optional[RiskLevel] = None
    hazard_type: Optional[str] = None

class RiskAssessment(RiskAssessmentBase):
    id: UUID
    habitation_id: UUID
    assessment_timestamp: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
