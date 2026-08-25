from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.enums import Recommendation

class SiteAssessmentBase(BaseModel):
    safety_score: float = Field(..., ge=0.0, le=100.0)
    capacity_score: float = Field(..., ge=0.0, le=100.0)
    accessibility_score: float = Field(..., ge=0.0, le=100.0)
    infrastructure_score: float = Field(..., ge=0.0, le=100.0)
    community_score: float = Field(..., ge=0.0, le=100.0)
    overall_score: float = Field(..., ge=0.0, le=100.0)
    
    recommendation: Recommendation
    rejection_reason: Optional[str] = None

class SiteAssessmentCreate(SiteAssessmentBase):
    pass

class SiteAssessmentUpdate(SiteAssessmentBase):
    pass

class SiteAssessment(SiteAssessmentBase):
    id: UUID
    site_id: UUID
    assessed_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
