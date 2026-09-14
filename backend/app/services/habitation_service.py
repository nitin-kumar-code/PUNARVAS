from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from app.models.enums import RiskLevel, EvacuationStatus
from app.services.json_data_service import json_data_service

def _map_json_to_dict(hab: Dict[str, Any]) -> dict:
    triage = hab.get("triage_level", "").upper()
    risk_level = None
    if "CRITICAL" in triage:
        risk_level = RiskLevel.CRITICAL
    elif "HIGH" in triage or "SEVERE" in triage:
        risk_level = RiskLevel.HIGH
    elif "MODERATE" in triage or "MEDIUM" in triage:
        risk_level = RiskLevel.MEDIUM
    elif "LOW" in triage:
        risk_level = RiskLevel.LOW
        
    return {
        "id": hab["id"], # Provided by JSONDataService
        "habitation_id": hab.get("habitation_id"),
        "name": hab.get("village_name", "Unknown Village"),
        "village_name": hab.get("village_name"),
        "district": hab.get("sub_district", "Unknown"),
        "sub_district": hab.get("sub_district"),
        "state": "Uttarakhand",
        "block": hab.get("sub_district", "Unknown"),
        "latitude": hab.get("latitude", 0.0),
        "longitude": hab.get("longitude", 0.0),
        "population": hab.get("population", 0),
        "total_population": hab.get("population", 0),
        "households": 0,
        "vulnerable_population": 0,
        "hazard_component": hab.get("hazard_component"),
        "exposure_component": hab.get("exposure_component"),
        "vulnerability_component": hab.get("vulnerability_component"),
        "risk_score": hab.get("risk_score"),
        "triage_level": hab.get("triage_level"),
        "confidence_score": hab.get("confidence_score"),
        "explanation": hab.get("explanation"),
        "risk_level": risk_level,
        "primary_hazard": "Unknown", 
        "hazards": hab.get("hazards"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

class HabitationService:
    def __init__(self, db=None): 
        self.db = db
        self.data_service = json_data_service

    def get_all_habitations(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        import logging
        try:
            from app.services.ml_prediction_service import ml_prediction_service
            habs = ml_prediction_service.get_all_predictions()
        except Exception as e:
            logging.getLogger(__name__).error(f"Failed to load ML habitation data: {e}")
            # Fallback to legacy JSON
            try:
                habs = self.data_service.get_all_habitations()
            except Exception as e2:
                logging.getLogger(__name__).error(f"Failed to load fallback habitation data: {e2}")
                return []
            
        paginated = habs[skip : skip + limit]
        return [_map_json_to_dict(h) for h in paginated]

    def get_habitation_by_id(self, id: uuid.UUID) -> Optional[Dict[str, Any]]:
        # Fetch all habitations from ML (or fallback) and find by ID
        habs = self.get_all_habitations(limit=9999)
        for hab in habs:
            if hab["id"] == id:
                return hab
        return None

    def get_risk_zones(self, min_risk_level: List[RiskLevel] = [RiskLevel.CRITICAL, RiskLevel.HIGH]) -> List[Dict[str, Any]]:
        habs = self.get_all_habitations(limit=9999)
        results = []
        for mapped in habs:
            if mapped["risk_level"] in min_risk_level:
                results.append({
                    "id": str(mapped["id"]),
                    "name": mapped["name"],
                    "latitude": mapped["latitude"],
                    "longitude": mapped["longitude"],
                    "risk_score": mapped["risk_score"],
                    "risk_level": mapped["risk_level"].value if mapped["risk_level"] else None,
                    "primary_hazard": mapped["primary_hazard"],
                    "vulnerable_population": mapped.get("vulnerable_population", 0)
                })
        return results
        
    def get_relocation_candidates(self, limit: int = 50) -> List[Dict[str, Any]]:
        habs = self.get_all_habitations(limit=9999)
        candidates = []
        for mapped in habs:
            is_critical = mapped["risk_level"] == RiskLevel.CRITICAL
            high_score = mapped["risk_score"] and mapped["risk_score"] >= 85
            
            if is_critical or high_score:
                reason = []
                if is_critical: reason.append("CRITICAL risk level")
                if high_score: reason.append("Score >= 85")
                
                candidates.append({
                    "habitation_id": str(mapped["id"]),
                    "name": mapped["name"],
                    "risk_score": mapped["risk_score"],
                    "vulnerable_population": mapped.get("vulnerable_population", 0),
                    "primary_hazard": mapped.get("primary_hazard"),
                    "reason_for_priority": ", ".join(reason)
                })
                
                if len(candidates) >= limit:
                    break
        return candidates
