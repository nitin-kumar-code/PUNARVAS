from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.schemas.habitation import Habitation as HabitationSchema, HabitationCreate, HabitationUpdate
from app.services.habitation_service import HabitationService

router = APIRouter()

@router.get("/", response_model=List[HabitationSchema])
def read_habitations(skip: int = 0, limit: int = 100):
    service = HabitationService()
    return service.get_all_habitations(skip=skip, limit=limit)

@router.get("/{id}", response_model=HabitationSchema)
def read_habitation(id: UUID):
    service = HabitationService()
    hab = service.get_habitation_by_id(id)
    if hab is None:
        raise HTTPException(status_code=404, detail="Habitation not found")
    return hab

# Write operations disabled — using immutable ML dataset.
# db param retained for future re-enabling.
@router.post("/", response_model=HabitationSchema, status_code=status.HTTP_201_CREATED)
def create_habitation(habitation: HabitationCreate, db: Session = Depends(get_db)):
    raise HTTPException(status_code=403, detail="Write operations disabled - using immutable ML dataset")

@router.put("/{id}", response_model=HabitationSchema)
def update_habitation(id: UUID, habitation: HabitationUpdate, db: Session = Depends(get_db)):
    raise HTTPException(status_code=403, detail="Write operations disabled - using immutable ML dataset")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habitation(id: UUID, db: Session = Depends(get_db)):
    raise HTTPException(status_code=403, detail="Write operations disabled - using immutable ML dataset")

@router.get("/{id}/risk")
def read_habitation_risk(id: UUID):
    raise HTTPException(status_code=404, detail="Risk assessment legacy table disabled")
