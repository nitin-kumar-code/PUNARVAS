from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy import UUID, JSON
from datetime import datetime, timezone
from app.db.base import Base

class DecisionReceipt(Base):
    __tablename__ = "decision_receipts"

    relocation_plan_id = Column(UUID(as_uuid=True), ForeignKey("relocation_plans.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    decision_type = Column(String, nullable=False)
    decision_summary = Column(Text, nullable=False)
    
    risk_score = Column(Float, nullable=False)
    primary_reason = Column(Text, nullable=False)
    
    evidence = Column(JSON, nullable=False, default={})
    confidence_score = Column(Float, nullable=False)
    
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    relocation_plan = relationship("RelocationPlan", back_populates="decision_receipt")
