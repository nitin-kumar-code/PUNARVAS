from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class AllocationBase(BaseModel):
    candidate_site_id: UUID
    population_allocated: int = Field(..., ge=0)
    vulnerable_population_allocated: int = Field(0, ge=0)
    travel_time_minutes: Optional[float] = Field(None, ge=0.0)
    allocation_percentage: float = Field(0.0, ge=0.0, le=100.0)

class AllocationCreate(AllocationBase):
    pass

class AllocationUpdate(AllocationBase):
    candidate_site_id: Optional[UUID] = None
    population_allocated: Optional[int] = None

class Allocation(AllocationBase):
    id: UUID
    relocation_plan_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
