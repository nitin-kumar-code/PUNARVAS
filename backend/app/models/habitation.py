from sqlalchemy import Column, String, Float, Integer, Enum, Boolean, CheckConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import PriorityLevel, EvacuationStatus, RiskLevel

class Habitation(Base):
    __tablename__ = "habitations"

    name = Column(String, index=True, nullable=False)
    state = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    block = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    total_population = Column(Integer, nullable=False, default=0)
    vulnerable_population = Column(Integer, nullable=False, default=0)
    households = Column(Integer, nullable=False, default=0)
    
    primary_hazard = Column(String, nullable=True)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=True)
    
    priority_level = Column(Enum(PriorityLevel), default=PriorityLevel.P3)
    evacuation_status = Column(Enum(EvacuationStatus), default=EvacuationStatus.PENDING)

    __table_args__ = (
        CheckConstraint('total_population >= 0', name='check_population_positive'),
        CheckConstraint('vulnerable_population >= 0', name='check_vuln_population_positive'),
        CheckConstraint('vulnerable_population <= total_population', name='check_vuln_population_less_than_total'),
        CheckConstraint('latitude >= -90 AND latitude <= 90', name='check_latitude_range'),
        CheckConstraint('longitude >= -180 AND longitude <= 180', name='check_longitude_range'),
        CheckConstraint('risk_score >= 0 AND risk_score <= 100', name='check_risk_score_range'),
    )

    # Relationships
    risk_assessments = relationship("RiskAssessment", back_populates="habitation", cascade="all, delete-orphan")
    relocation_plans = relationship("RelocationPlan", back_populates="source_habitation")
