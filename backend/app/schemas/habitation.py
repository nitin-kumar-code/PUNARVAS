from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.enums import PriorityLevel, EvacuationStatus, RiskLevel

class HabitationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1)
    district: str = Field(..., min_length=1)
    block: str = Field(..., min_length=1)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    
    total_population: int = Field(0, ge=0)
    vulnerable_population: int = Field(0, ge=0)
    households: int = Field(0, ge=0)
    
    primary_hazard: Optional[str] = None
    risk_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    risk_level: Optional[RiskLevel] = None
    
    priority_level: PriorityLevel = PriorityLevel.P3
    evacuation_status: EvacuationStatus = EvacuationStatus.PENDING

class HabitationCreate(HabitationBase):
    pass

class HabitationUpdate(HabitationBase):
    name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    block: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_population: Optional[int] = Field(None, ge=0)
    vulnerable_population: Optional[int] = Field(None, ge=0)

class Habitation(HabitationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
