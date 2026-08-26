from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.models.enums import RiskLevel, SiteStatus
from app.services.habitation_service import HabitationService

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    habs = db.query(Habitation).all()
    sites = db.query(CandidateSite).all()
    
    total_habitations = len(habs)
    critical_habitations = sum(1 for h in habs if h.risk_level == RiskLevel.CRITICAL)
    
    # Calculate populations
    vulnerable_population = sum(h.vulnerable_population or 0 for h in habs)
    critical_pop = sum(h.total_population or 0 for h in habs if h.risk_level == RiskLevel.CRITICAL)
    high_pop = sum(h.total_population or 0 for h in habs if h.risk_level == RiskLevel.HIGH)
    immediate_relocation = critical_pop # Based on critical pop
    
    # Capacities
    safe_relocation_capacity = sum(s.capacity_people or 0 for s in sites if s.status == SiteStatus.ACTIVE)
    available_relocation_capacity = sum(s.available_capacity or 0 for s in sites if s.status == SiteStatus.ACTIVE)
    
    # Risk Distribution
    risk_distribution = {
        "critical": sum(1 for h in habs if h.risk_level == RiskLevel.CRITICAL),
        "high": sum(1 for h in habs if h.risk_level == RiskLevel.HIGH),
        "medium": sum(1 for h in habs if h.risk_level == RiskLevel.MEDIUM),
        "low": sum(1 for h in habs if h.risk_level == RiskLevel.LOW)
    }
    
    # Average Risk Score
    scores = [h.risk_score for h in habs if h.risk_score is not None]
    average_risk_score = round(sum(scores) / len(scores), 2) if scores else 0.0
    
    # Relocation Coverage
    total_pop = sum(h.total_population or 0 for h in habs)
    relocation_coverage = round((available_relocation_capacity / total_pop) * 100, 2) if total_pop > 0 else 100.0
    
    # Priorities
    sorted_habs = sorted([h for h in habs if h.risk_score is not None], key=lambda x: x.risk_score, reverse=True)
    priority_habitations = []
    for h in sorted_habs[:5]:
        priority_habitations.append({
            "id": str(h.id),
            "name": h.name,
            "population": h.total_population,
            "risk_score": h.risk_score
        })
        
    service = HabitationService(db)
    immediate_candidates = service.get_relocation_candidates()

    return {
        "total_habitations": total_habitations,
        "critical_habitations": critical_habitations,
        "immediate_relocation": immediate_relocation,
        "vulnerable_population": vulnerable_population,
        "safe_relocation_capacity": safe_relocation_capacity,
        "available_relocation_capacity": available_relocation_capacity,
        "critical_population": critical_pop,
        "high_risk_population": high_pop,
        "average_risk_score": average_risk_score,
        "relocation_coverage": relocation_coverage,
        "risk_distribution": risk_distribution,
        "priority_habitations": priority_habitations,
        "immediate_relocation_candidates": immediate_candidates
    }
