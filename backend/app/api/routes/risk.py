from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.risk_assessment import RiskAssessment
from app.schemas.risk import RiskAssessment as RiskAssessmentSchema

router = APIRouter()

# Note: this would typically be under /api/habitations/{id}/risk, so we can define it here 
# and also map it, or define it in habitations.py. Let's just create it here as part of risk router for /api/risks
# and we'll add the habitation specific one here too.

@router.get("/{id}", response_model=RiskAssessmentSchema)
def read_risk(id: UUID, db: Session = Depends(get_db)):
    db_risk = db.query(RiskAssessment).filter(RiskAssessment.id == id).first()
    if db_risk is None:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    return db_risk
