from sqlalchemy import Column, String, Float, Integer, Enum, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import SiteStatus

class CandidateSite(Base):
    __tablename__ = "candidate_sites"

    name = Column(String, index=True, nullable=False)
    state = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    capacity_households = Column(Integer, nullable=False, default=0)
    capacity_people = Column(Integer, nullable=False, default=0)
    available_capacity = Column(Integer, nullable=False, default=0)
    
    water_availability = Column(Boolean, default=False)
    electricity_availability = Column(Boolean, default=False)
    healthcare_access = Column(Boolean, default=False)
    road_accessibility = Column(Boolean, default=False)
    shelter_availability = Column(Boolean, default=False)
    
    flood_risk = Column(Float, default=0.0)
    landslide_risk = Column(Float, default=0.0)
    earthquake_risk = Column(Float, default=0.0)
    
    overall_safety_score = Column(Float, nullable=True)
    status = Column(Enum(SiteStatus), default=SiteStatus.ACTIVE)

    # Relationships
    assessments = relationship("SiteAssessment", back_populates="site", cascade="all, delete-orphan")
    allocations = relationship("Allocation", back_populates="candidate_site")
