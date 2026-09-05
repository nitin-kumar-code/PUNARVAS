from sqlalchemy import Column, Integer, Float, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy import UUID
from app.db.base import Base
from app.models.enums import RelocationStatus

class RelocationPlan(Base):
    __tablename__ = "relocation_plans"

    source_habitation_id = Column(UUID(as_uuid=True), ForeignKey("habitations.id", ondelete="RESTRICT"), nullable=False)
    
    total_population = Column(Integer, nullable=False)
    vulnerable_population = Column(Integer, nullable=False)
    allocated_population = Column(Integer, nullable=False, default=0)
    uncovered_population = Column(Integer, nullable=True, default=0)
    
    status = Column(Enum(RelocationStatus), default=RelocationStatus.DRAFT)
    
    total_travel_time = Column(Float, nullable=True) # E.g., average or total estimated minutes
    coverage_percentage = Column(Float, nullable=False, default=0.0)
    
    rejected_sites = Column(JSON, nullable=True, default=list)

    # Relationships
    source_habitation = relationship("Habitation", back_populates="relocation_plans")
    allocations = relationship("Allocation", back_populates="relocation_plan", cascade="all, delete-orphan")
    decision_receipt = relationship("DecisionReceipt", back_populates="relocation_plan", uselist=False, cascade="all, delete-orphan")
