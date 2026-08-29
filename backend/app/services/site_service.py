from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from app.models.enums import SiteStatus
from app.services.json_data_service import json_data_service

def _map_json_to_dict(site: Dict[str, Any]) -> dict:
    is_safe = site.get("safe", False)
    status = SiteStatus.ACTIVE if is_safe else SiteStatus.UNSAFE
    
    return {
        "id": site["id"], # UUID5 from JSONDataService
        "site_id_str": site.get("site_id"),
        "name": site.get("site_name", "Unknown Site"),
        "site_name": site.get("site_name"),
        "district": "Chamoli", 
        "state": "Uttarakhand",
        "latitude": site.get("latitude", 0.0),
        "longitude": site.get("longitude", 0.0),
        
        "hazard_score": site.get("hazard_score"),
        "site_safety_score": site.get("site_safety_score"),
        "site_risk_score": site.get("site_risk_score"),
        "site_tier": site.get("site_tier"),
        "confidence_score": site.get("confidence_score"),
        "safe": is_safe,
        "explanation": site.get("explanation"),
        
        "overall_safety_score": site.get("site_safety_score"),
        "status": status,
        "capacity_people": site.get("capacity_people"), 
        "capacity_households": 0,
        "available_capacity": site.get("available_capacity"),
        
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

class SiteService:
    def __init__(self, db=None):
        self.db = db
        self.data_service = json_data_service
        
    def get_all_sites(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        try:
            sites = self.data_service.get_all_sites()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to load site data: {e}")
            return []
            
        paginated = sites[skip : skip + limit]
        return [_map_json_to_dict(s) for s in paginated]

    def get_site_by_id(self, id: uuid.UUID) -> Optional[Dict[str, Any]]:
        site = self.data_service.get_site_by_id(id)
        if site:
            return _map_json_to_dict(site)
        return None

    def get_safe_sites(self) -> List[Dict[str, Any]]:
        sites = self.data_service.get_all_sites()
        results = []
        for s in sites:
            mapped = _map_json_to_dict(s)
            if mapped["safe"]:
                results.append(mapped)
        return results
