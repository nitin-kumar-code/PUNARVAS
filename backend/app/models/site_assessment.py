from sqlalchemy import Column, Float, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from app.db.base import Base
from app.models.enums import Recommendation

class SiteAssessment(Base):
    __tablename__ = "site_assessments"

    site_id = Column(UUID(as_uuid=True), ForeignKey("candidate_sites.id", ondelete="CASCADE"), nullable=False)
    
    safety_score = Column(Float, nullable=False)
    capacity_score = Column(Float, nullable=False)
    accessibility_score = Column(Float, nullable=False)
    infrastructure_score = Column(Float, nullable=False)
    community_score = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    
    recommendation = Column(Enum(Recommendation), nullable=False)
    rejection_reason = Column(Text, nullable=True)
    
    assessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    site = relationship("CandidateSite", back_populates="assessments")
