from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.enums import SiteStatus

class CandidateSiteBase(BaseModel):
    # Required fields ensuring data integrity against malformed ML output
    name: str = Field(..., min_length=1)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    
    # Capacity fields — Optional because ML JSON may not provide them
    capacity_people: Optional[int] = Field(None, ge=0)
    available_capacity: Optional[int] = Field(None, ge=0)
    
    # Keeping original schema fields with sensible defaults or Optional
    state: str = Field(default="Uttarakhand", min_length=1)
    district: str = Field(default="Unknown", min_length=1)
    
    # JSON-specific fields
    site_id_str: Optional[str] = None # Original S001 etc
    site_name: Optional[str] = None
    hazard_score: Optional[float] = None
    site_safety_score: Optional[float] = None
    site_risk_score: Optional[float] = None
    site_tier: Optional[str] = None
    confidence_score: Optional[float] = None
    safe: Optional[bool] = None
    explanation: Optional[str] = None
    
    capacity_households: Optional[int] = Field(0, ge=0)
    
    water_availability: bool = False
    electricity_availability: bool = False
    healthcare_access: bool = False
    road_accessibility: bool = False
    shelter_availability: bool = False
    
    flood_risk: Optional[float] = Field(None, ge=0.0, le=100.0)
    landslide_risk: Optional[float] = Field(None, ge=0.0, le=100.0)
    earthquake_risk: Optional[float] = Field(None, ge=0.0, le=100.0)
    
    overall_safety_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    accessibility_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    infrastructure_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    healthcare_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    community_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    
    status: SiteStatus = SiteStatus.ACTIVE

class CandidateSiteCreate(CandidateSiteBase):
    pass

class CandidateSiteUpdate(CandidateSiteBase):
    pass

class CandidateSite(CandidateSiteBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
