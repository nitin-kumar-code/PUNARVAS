from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.habitation import Habitation
from app.schemas.habitation import Habitation as HabitationSchema, HabitationCreate, HabitationUpdate
from app.models.risk_assessment import RiskAssessment
from app.schemas.risk import RiskAssessment as RiskAssessmentSchema

router = APIRouter()

@router.get("/", response_model=List[HabitationSchema])
def read_habitations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Habitation).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=HabitationSchema)
def read_habitation(id: UUID, db: Session = Depends(get_db)):
    db_hab = db.query(Habitation).filter(Habitation.id == id).first()
    if db_hab is None:
        raise HTTPException(status_code=404, detail="Habitation not found")
    return db_hab

@router.post("/", response_model=HabitationSchema, status_code=status.HTTP_201_CREATED)
def create_habitation(habitation: HabitationCreate, db: Session = Depends(get_db)):
    if habitation.vulnerable_population > habitation.total_population:
        raise HTTPException(status_code=400, detail="Vulnerable population cannot exceed total population")
    db_hab = Habitation(**habitation.model_dump())
    db.add(db_hab)
    db.commit()
    db.refresh(db_hab)
    return db_hab

@router.put("/{id}", response_model=HabitationSchema)
def update_habitation(id: UUID, habitation: HabitationUpdate, db: Session = Depends(get_db)):
    db_hab = db.query(Habitation).filter(Habitation.id == id).first()
    if db_hab is None:
        raise HTTPException(status_code=404, detail="Habitation not found")
    
    update_data = habitation.model_dump(exclude_unset=True)
    if "total_population" in update_data or "vulnerable_population" in update_data:
        tot = update_data.get("total_population", db_hab.total_population)
        vul = update_data.get("vulnerable_population", db_hab.vulnerable_population)
        if vul > tot:
             raise HTTPException(status_code=400, detail="Vulnerable population cannot exceed total population")

    for key, value in update_data.items():
        setattr(db_hab, key, value)
    
    db.commit()
    db.refresh(db_hab)
    return db_hab

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habitation(id: UUID, db: Session = Depends(get_db)):
    db_hab = db.query(Habitation).filter(Habitation.id == id).first()
    if db_hab is None:
        raise HTTPException(status_code=404, detail="Habitation not found")
    db.delete(db_hab)
    db.commit()
    return None

@router.get("/{id}/risk", response_model=RiskAssessmentSchema)
def read_habitation_risk(id: UUID, db: Session = Depends(get_db)):
    db_risk = db.query(RiskAssessment).filter(RiskAssessment.habitation_id == id).order_by(RiskAssessment.assessment_timestamp.desc()).first()
    if db_risk is None:
        raise HTTPException(status_code=404, detail="Risk assessment not found for this habitation")
    return db_risk
