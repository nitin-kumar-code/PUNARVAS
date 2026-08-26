from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class SiteHazardExposureBase(BaseModel):
    site_id: UUID
    hazard_type: str = Field(..., min_length=1)
    exposure_score: float = Field(..., ge=0.0, le=100.0)
    status_reason: Optional[str] = None

class SiteHazardExposureCreate(SiteHazardExposureBase):
    pass

class SiteHazardExposureUpdate(SiteHazardExposureBase):
    hazard_type: Optional[str] = None
    exposure_score: Optional[float] = None

class SiteHazardExposure(SiteHazardExposureBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
