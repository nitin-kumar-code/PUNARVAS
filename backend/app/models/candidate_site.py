from sqlalchemy import Column, String, Float, Integer, Enum, Boolean, CheckConstraint
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
    capacity_people = Column(Integer, nullable=False, default=0) # Acts as total_capacity
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
    accessibility_score = Column(Float, nullable=True)
    infrastructure_score = Column(Float, nullable=True)
    healthcare_score = Column(Float, nullable=True)
    community_score = Column(Float, nullable=True)
    
    status = Column(Enum(SiteStatus), default=SiteStatus.ACTIVE)

    __table_args__ = (
        CheckConstraint('capacity_people >= 0', name='check_total_capacity_positive'),
        CheckConstraint('available_capacity >= 0', name='check_available_capacity_positive'),
        CheckConstraint('available_capacity <= capacity_people', name='check_available_capacity_limit'),
        CheckConstraint('latitude >= -90 AND latitude <= 90', name='check_site_latitude_range'),
        CheckConstraint('longitude >= -180 AND longitude <= 180', name='check_site_longitude_range'),
        CheckConstraint('overall_safety_score >= 0 AND overall_safety_score <= 100', name='check_safety_score_range'),
        CheckConstraint('accessibility_score >= 0 AND accessibility_score <= 100', name='check_accessibility_score_range'),
        CheckConstraint('infrastructure_score >= 0 AND infrastructure_score <= 100', name='check_infrastructure_score_range'),
        CheckConstraint('healthcare_score >= 0 AND healthcare_score <= 100', name='check_healthcare_score_range'),
        CheckConstraint('community_score >= 0 AND community_score <= 100', name='check_community_score_range'),
    )

    # Relationships
    assessments = relationship("SiteAssessment", back_populates="site", cascade="all, delete-orphan")
    allocations = relationship("Allocation", back_populates="candidate_site")
