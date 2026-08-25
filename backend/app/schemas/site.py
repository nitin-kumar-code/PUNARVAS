from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.enums import SiteStatus

class CandidateSiteBase(BaseModel):
    name: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    district: str = Field(..., min_length=1)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    
    capacity_households: int = Field(0, ge=0)
    capacity_people: int = Field(0, ge=0)
    available_capacity: int = Field(0, ge=0)
    
    water_availability: bool = False
    electricity_availability: bool = False
    healthcare_access: bool = False
    road_accessibility: bool = False
    shelter_availability: bool = False
    
    flood_risk: float = Field(0.0, ge=0.0, le=100.0)
    landslide_risk: float = Field(0.0, ge=0.0, le=100.0)
    earthquake_risk: float = Field(0.0, ge=0.0, le=100.0)
    
    overall_safety_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    status: SiteStatus = SiteStatus.ACTIVE

class CandidateSiteCreate(CandidateSiteBase):
    pass

class CandidateSiteUpdate(CandidateSiteBase):
    name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CandidateSite(CandidateSiteBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
