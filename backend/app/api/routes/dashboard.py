from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from app.core.database import get_db
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.models.enums import RiskLevel, PriorityLevel

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_habitations = db.query(Habitation).count()
    
    # Needs to match RiskLevel enum (which is a string internally or enum type). 
    # For now we rely on the risk_score mapped to enums or just priority levels if risk_level isn't on Habitation.
    # Actually, RiskAssessment has risk_level, but Habitation has priority_level. Let's aggregate from risk assessments.
    from app.models.risk_assessment import RiskAssessment
    
    critical_habs = db.query(RiskAssessment).filter(RiskAssessment.risk_level == RiskLevel.CRITICAL).count()
    immediate_relocation_pop = db.query(func.sum(Habitation.total_population)).filter(Habitation.priority_level == PriorityLevel.P1).scalar() or 0
    vulnerable_pop = db.query(func.sum(Habitation.vulnerable_population)).scalar() or 0
    safe_capacity = db.query(func.sum(CandidateSite.available_capacity)).scalar() or 0
    
    risk_distribution = {
        "critical": db.query(RiskAssessment).filter(RiskAssessment.risk_level == RiskLevel.CRITICAL).count(),
        "high": db.query(RiskAssessment).filter(RiskAssessment.risk_level == RiskLevel.HIGH).count(),
        "medium": db.query(RiskAssessment).filter(RiskAssessment.risk_level == RiskLevel.MEDIUM).count(),
        "low": db.query(RiskAssessment).filter(RiskAssessment.risk_level == RiskLevel.LOW).count(),
    }
    
    priority_habs = db.query(Habitation).filter(Habitation.priority_level == PriorityLevel.P1).limit(5).all()
    priority_list = [{"id": str(h.id), "name": h.name, "population": h.total_population, "risk_score": h.risk_score} for h in priority_habs]

    return {
        "total_habitations": total_habitations,
        "critical_habitations": critical_habs,
        "immediate_relocation": int(immediate_relocation_pop),
        "vulnerable_population": int(vulnerable_pop),
        "safe_relocation_capacity": int(safe_capacity),
        "risk_distribution": risk_distribution,
        "priority_habitations": priority_list
    }
