from sqlalchemy import Column, Float, String, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from app.db.base import Base
from app.models.enums import RiskLevel

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    habitation_id = Column(UUID(as_uuid=True), ForeignKey("habitations.id", ondelete="CASCADE"), nullable=False)
    
    overall_score = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    
    hazard_type = Column(String, nullable=False)
    hazard_exposure = Column(Float, nullable=False)
    terrain_factor = Column(Float, nullable=False)
    population_vulnerability = Column(Float, nullable=False)
    infrastructure_vulnerability = Column(Float, nullable=False)
    accessibility_factor = Column(Float, nullable=False)
    historical_exposure = Column(Float, nullable=False)
    
    confidence_score = Column(Float, nullable=False)
    primary_driver = Column(String, nullable=True)
    
    assessment_timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    habitation = relationship("Habitation", back_populates="risk_assessments")
