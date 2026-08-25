from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class DecisionReceiptBase(BaseModel):
    relocation_plan_id: UUID
    decision_type: str = Field(..., min_length=1)
    decision_summary: str = Field(..., min_length=1)
    risk_score: float = Field(..., ge=0.0, le=100.0)
    primary_reason: str = Field(..., min_length=1)
    evidence: Dict[str, Any] = Field(default_factory=dict)
    confidence_score: float = Field(..., ge=0.0, le=100.0)

class DecisionReceiptCreate(DecisionReceiptBase):
    pass

class DecisionReceiptUpdate(DecisionReceiptBase):
    pass

class DecisionReceipt(DecisionReceiptBase):
    id: UUID
    generated_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
