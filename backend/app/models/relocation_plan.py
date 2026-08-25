from sqlalchemy import Column, Integer, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
from app.models.enums import RelocationStatus

class RelocationPlan(Base):
    __tablename__ = "relocation_plans"

    source_habitation_id = Column(UUID(as_uuid=True), ForeignKey("habitations.id", ondelete="RESTRICT"), nullable=False)
    
    total_population = Column(Integer, nullable=False)
    vulnerable_population = Column(Integer, nullable=False)
    
    status = Column(Enum(RelocationStatus), default=RelocationStatus.DRAFT)
    
    total_travel_time = Column(Float, nullable=True) # E.g., average or total estimated minutes
    coverage_percentage = Column(Float, nullable=False, default=0.0)

    # Relationships
    source_habitation = relationship("Habitation", back_populates="relocation_plans")
    allocations = relationship("Allocation", back_populates="relocation_plan", cascade="all, delete-orphan")
    decision_receipt = relationship("DecisionReceipt", back_populates="relocation_plan", uselist=False, cascade="all, delete-orphan")
