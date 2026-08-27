from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.enums import PriorityLevel, EvacuationStatus, RiskLevel

class HabitationBase(BaseModel):
    # Required fields ensuring data integrity
    name: str = Field(..., min_length=1, max_length=100)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    total_population: int = Field(..., ge=0)
    
    # Keeping original schema fields with sensible defaults or Optional
    state: str = Field(default="Uttarakhand", min_length=1)
    district: str = Field(default="Unknown", min_length=1)
    block: str = Field(default="Unknown", min_length=1)
    
    # JSON-specific fields
    habitation_id: Optional[int] = None
    village_name: Optional[str] = None
    sub_district: Optional[str] = None
    population: Optional[int] = None
    
    vulnerable_population: int = Field(0, ge=0)
    households: int = Field(0, ge=0)
    
    hazard_component: Optional[float] = None
    exposure_component: Optional[float] = None
    vulnerability_component: Optional[float] = None
    
    primary_hazard: Optional[str] = None
    risk_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    triage_level: Optional[str] = None
    confidence_score: Optional[float] = None
    explanation: Optional[str] = None
    
    risk_level: Optional[RiskLevel] = None
    priority_level: PriorityLevel = PriorityLevel.P3
    evacuation_status: EvacuationStatus = EvacuationStatus.PENDING

class HabitationCreate(HabitationBase):
    pass

class HabitationUpdate(HabitationBase):
    pass

class Habitation(HabitationBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
