from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Allocation(Base):
    __tablename__ = "allocations"

    relocation_plan_id = Column(UUID(as_uuid=True), ForeignKey("relocation_plans.id", ondelete="CASCADE"), nullable=False)
    candidate_site_id = Column(UUID(as_uuid=True), ForeignKey("candidate_sites.id", ondelete="RESTRICT"), nullable=False)
    source_habitation_id = Column(UUID(as_uuid=True), ForeignKey("habitations.id", ondelete="RESTRICT"), nullable=True)
    
    population_allocated = Column(Integer, nullable=False)
    vulnerable_population_allocated = Column(Integer, nullable=False, default=0)
    
    travel_time_minutes = Column(Float, nullable=True)
    distance_km = Column(Float, nullable=True)
    site_score = Column(Float, nullable=True)
    allocation_percentage = Column(Float, nullable=False, default=0.0)

    # Relationships
    relocation_plan = relationship("RelocationPlan", back_populates="allocations")
    candidate_site = relationship("CandidateSite", back_populates="allocations")
    source_habitation = relationship("Habitation")
