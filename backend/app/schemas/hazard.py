from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class HazardBase(BaseModel):
    type: str = Field(..., min_length=1)
    severity: float = Field(..., ge=0.0, le=100.0)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    affected_area: Optional[str] = None

class HazardCreate(HazardBase):
    pass

class HazardUpdate(HazardBase):
    type: Optional[str] = None
    severity: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Hazard(HazardBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
