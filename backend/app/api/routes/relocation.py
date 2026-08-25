from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.relocation_plan import RelocationPlan
from app.models.allocation import Allocation
from app.models.candidate_site import CandidateSite
from app.schemas.relocation import RelocationPlan as RelocationPlanSchema, RelocationPlanCreate
from app.schemas.allocation import Allocation as AllocationSchema, AllocationCreate

router = APIRouter()

@router.get("/", response_model=List[RelocationPlanSchema])
def read_relocation_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(RelocationPlan).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=RelocationPlanSchema)
def read_relocation_plan(id: UUID, db: Session = Depends(get_db)):
    db_plan = db.query(RelocationPlan).filter(RelocationPlan.id == id).first()
    if db_plan is None:
        raise HTTPException(status_code=404, detail="Relocation plan not found")
    return db_plan

@router.post("/", response_model=RelocationPlanSchema, status_code=status.HTTP_201_CREATED)
def create_relocation_plan(plan: RelocationPlanCreate, db: Session = Depends(get_db)):
    db_plan = RelocationPlan(**plan.model_dump())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/{id}/allocations", response_model=List[AllocationSchema])
def read_allocations(id: UUID, db: Session = Depends(get_db)):
    return db.query(Allocation).filter(Allocation.relocation_plan_id == id).all()

@router.post("/{id}/allocations", response_model=AllocationSchema, status_code=status.HTTP_201_CREATED)
def create_allocation(id: UUID, allocation: AllocationCreate, db: Session = Depends(get_db)):
    # Validate plan exists
    db_plan = db.query(RelocationPlan).filter(RelocationPlan.id == id).first()
    if db_plan is None:
        raise HTTPException(status_code=404, detail="Relocation plan not found")
        
    # Validate site exists and capacity
    site = db.query(CandidateSite).filter(CandidateSite.id == allocation.candidate_site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Candidate site not found")
    
    if allocation.population_allocated > site.available_capacity:
        raise HTTPException(status_code=400, detail="Allocation exceeds available capacity")
        
    db_alloc = Allocation(**allocation.model_dump(), relocation_plan_id=id)
    site.available_capacity -= allocation.population_allocated
    
    db.add(db_alloc)
    db.commit()
    db.refresh(db_alloc)
    return db_alloc
