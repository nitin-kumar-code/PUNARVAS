from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.decision_receipt import DecisionReceipt
from app.schemas.decision import DecisionReceipt as DecisionReceiptSchema, DecisionReceiptCreate

router = APIRouter()

@router.get("/", response_model=List[DecisionReceiptSchema])
def read_decisions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(DecisionReceipt).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=DecisionReceiptSchema)
def read_decision(id: UUID, db: Session = Depends(get_db)):
    db_decision = db.query(DecisionReceipt).filter(DecisionReceipt.id == id).first()
    if db_decision is None:
        raise HTTPException(status_code=404, detail="Decision receipt not found")
    return db_decision

@router.post("/", response_model=DecisionReceiptSchema, status_code=status.HTTP_201_CREATED)
def create_decision(decision: DecisionReceiptCreate, db: Session = Depends(get_db)):
    db_decision = DecisionReceipt(**decision.model_dump())
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)
    return db_decision
