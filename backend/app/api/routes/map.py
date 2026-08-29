from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.risk_assessment import RiskAssessment
from app.models.enums import RiskLevel
from app.services.habitation_service import HabitationService
from app.services.site_service import SiteService

router = APIRouter()

@router.get("/habitations")
def get_map_habitations():
    """GIS habitation layer — reads from authoritative JSON data."""
    service = HabitationService()
    habs = service.get_all_habitations(limit=5000)
    results = []
    for hab in habs:
        risk_level = hab["risk_level"].value if hab.get("risk_level") else "UNKNOWN"
        results.append({
            "id": str(hab["id"]),
            "name": hab["name"],
            "latitude": hab["latitude"],
            "longitude": hab["longitude"],
            "risk_score": hab["risk_score"],
            "risk_level": risk_level,
            "population": hab["total_population"],
            "vulnerable_population": hab.get("vulnerable_population", 0)
        })
    return results

@router.get("/sites")
def get_map_sites():
    """GIS site layer — reads from authoritative JSON data."""
    service = SiteService()
    sites = service.get_all_sites(limit=1000)
    results = []
    for site in sites:
        results.append({
            "id": str(site["id"]),
            "name": site["name"],
            "latitude": site["latitude"],
            "longitude": site["longitude"],
            "available_capacity": site.get("available_capacity"),
            "status": site["status"].value,
            "overall_safety_score": site.get("overall_safety_score")
        })
    return results

@router.get("/risk-zones")
def get_map_risk_zones(db: Session = Depends(get_db)):
    """
    GIS risk zone layer.
    
    NOTE: Unlike other endpoints which have been migrated to the JSON-backed service,
    this endpoint continues to query the legacy RiskAssessment database table.
    The map UI requires the 'hazard_type' field for correct filtering and visualization.
    Since the current ML-generated JSON does not natively provide 'hazard_type' as a distinct
    scalar field, this route will remain on the DB to prevent data regressions in the UI.
    """
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
