from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.hazard import Hazard
from app.schemas.hazard import Hazard as HazardSchema

router = APIRouter()

@router.get("/", response_model=List[HazardSchema])
def read_hazards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Hazard).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=HazardSchema)
def read_hazard(id: UUID, db: Session = Depends(get_db)):
    db_hazard = db.query(Hazard).filter(Hazard.id == id).first()
    if db_hazard is None:
        raise HTTPException(status_code=404, detail="Hazard not found")
    return db_hazard
