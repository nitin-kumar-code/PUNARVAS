from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.habitation import Habitation
from app.models.enums import RiskLevel, EvacuationStatus

class HabitationService:
    def __init__(self, db: Session):
        self.db = db
        
    def get_risk_zones(self, min_risk_level: List[RiskLevel] = [RiskLevel.CRITICAL, RiskLevel.HIGH]) -> List[Dict[str, Any]]:
        # Red zones are based on the latest assessment cached on the Habitation model
        habitations = self.db.query(Habitation).filter(Habitation.risk_level.in_(min_risk_level)).all()
        return [
            {
                "id": str(h.id),
                "name": h.name,
                "latitude": h.latitude,
                "longitude": h.longitude,
                "risk_score": h.risk_score,
                "risk_level": h.risk_level.value if h.risk_level else None,
                "primary_hazard": h.primary_hazard,
                "vulnerable_population": h.vulnerable_population
            }
            for h in habitations
        ]
        
    def get_relocation_candidates(self) -> List[Dict[str, Any]]:
        # Immediate relocation candidates: CRITICAL or score >= 85 or evacuation is urgent
        habitations = self.db.query(Habitation).filter(
            (Habitation.risk_level == RiskLevel.CRITICAL) |
            (Habitation.risk_score >= 85) |
            (Habitation.evacuation_status == EvacuationStatus.ROUTING)
        ).all()
        
        candidates = []
        for h in habitations:
            reason = []
            if h.risk_level == RiskLevel.CRITICAL: reason.append("CRITICAL risk level")
            if h.risk_score and h.risk_score >= 85: reason.append("Score >= 85")
            if h.evacuation_status == EvacuationStatus.ROUTING: reason.append("Evacuation Routing active")
            
            candidates.append({
                "habitation_id": str(h.id),
                "name": h.name,
                "risk_score": h.risk_score,
                "vulnerable_population": h.vulnerable_population,
                "primary_hazard": h.primary_hazard,
                "reason_for_priority": ", ".join(reason)
            })
        return candidates
