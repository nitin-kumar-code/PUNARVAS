from sqlalchemy import Column, String, Float, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class SiteHazardExposure(Base):
    __tablename__ = "site_hazard_exposures"
    
    site_id = Column(UUID(as_uuid=True), ForeignKey("candidate_sites.id"), nullable=False)
    hazard_type = Column(String, nullable=False)
    exposure_score = Column(Float, nullable=False) # 0-100
    status_reason = Column(Text, nullable=True)
    
    __table_args__ = (
        CheckConstraint('exposure_score >= 0 AND exposure_score <= 100', name='check_exposure_score_range'),
    )

    site = relationship("CandidateSite", backref="hazard_exposures")
