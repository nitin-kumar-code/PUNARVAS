from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.enums import RelocationStatus
from app.schemas.allocation import Allocation

class RelocationPlanBase(BaseModel):
    source_habitation_id: UUID
    total_population: int = Field(..., ge=0)
    vulnerable_population: int = Field(..., ge=0)
    status: RelocationStatus = RelocationStatus.DRAFT
    total_travel_time: Optional[float] = Field(None, ge=0.0)
    coverage_percentage: float = Field(0.0, ge=0.0, le=100.0)

class RelocationPlanCreate(RelocationPlanBase):
    pass

class RelocationPlanUpdate(RelocationPlanBase):
    source_habitation_id: Optional[UUID] = None
    total_population: Optional[int] = None
    vulnerable_population: Optional[int] = None

class RelocationPlan(RelocationPlanBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    # We could include allocations here if needed, but keeping it simple for now
    # allocations: List[Allocation] = []

    model_config = ConfigDict(from_attributes=True)
