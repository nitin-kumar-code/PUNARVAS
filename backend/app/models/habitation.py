from sqlalchemy import Column, String, Float, Integer, Enum, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import PriorityLevel, EvacuationStatus

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
    risk_score = Column(Float, nullable=True)  # Store risk score here for now
    
    priority_level = Column(Enum(PriorityLevel), default=PriorityLevel.P3)
    evacuation_status = Column(Enum(EvacuationStatus), default=EvacuationStatus.PENDING)

    # Relationships
    risk_assessments = relationship("RiskAssessment", back_populates="habitation", cascade="all, delete-orphan")
    relocation_plans = relationship("RelocationPlan", back_populates="source_habitation")
