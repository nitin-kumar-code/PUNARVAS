from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.models.risk_assessment import RiskAssessment
from app.models.enums import RiskLevel

router = APIRouter()

@router.get("/habitations")
def get_map_habitations(db: Session = Depends(get_db)):
    habitations = db.query(Habitation).all()
    results = []
    for hab in habitations:
        # Get latest risk assessment if available
        risk = db.query(RiskAssessment).filter(RiskAssessment.habitation_id == hab.id).order_by(RiskAssessment.assessment_timestamp.desc()).first()
        risk_level = risk.risk_level.value if risk else "UNKNOWN"
        results.append({
            "id": str(hab.id),
            "name": hab.name,
            "latitude": hab.latitude,
            "longitude": hab.longitude,
            "risk_score": hab.risk_score,
            "risk_level": risk_level,
            "population": hab.total_population,
            "vulnerable_population": hab.vulnerable_population
        })
    return results

@router.get("/sites")
def get_map_sites(db: Session = Depends(get_db)):
    sites = db.query(CandidateSite).all()
    results = []
    for site in sites:
        results.append({
            "id": str(site.id),
            "name": site.name,
            "latitude": site.latitude,
            "longitude": site.longitude,
            "available_capacity": site.available_capacity,
            "status": site.status.value,
            "overall_safety_score": site.overall_safety_score
        })
    return results

@router.get("/risk-zones")
def get_map_risk_zones(db: Session = Depends(get_db)):
    # Since we aren't using PostGIS polygons yet, we can return points and let frontend render heatmaps or circles
    critical_risks = db.query(RiskAssessment).filter(RiskAssessment.risk_level == RiskLevel.CRITICAL).all()
    zones = []
    for risk in critical_risks:
        hab = risk.habitation
        zones.append({
            "id": str(risk.id),
            "habitation_id": str(hab.id),
            "latitude": hab.latitude,
            "longitude": hab.longitude,
            "hazard_type": risk.hazard_type,
            "intensity": risk.overall_score
        })
    return zones
