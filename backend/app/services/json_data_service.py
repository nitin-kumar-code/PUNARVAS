import json
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
HABITATION_SCORES_PATH = PROJECT_ROOT / "ai-ml" / "outputs" / "habitation_scores.json"
SITE_SCORES_PATH = PROJECT_ROOT / "ai-ml" / "outputs" / "site_scores.json"

HABITATION_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
SITE_NAMESPACE = uuid.UUID('7ba7b810-9dad-11d1-80b4-00c04fd430c9')

class JSONDataService:
    def __init__(self):
        self._habitations: Optional[List[Dict[str, Any]]] = None
        self._habitations_by_uuid: Optional[Dict[uuid.UUID, Dict[str, Any]]] = None
        self._sites: Optional[List[Dict[str, Any]]] = None
        self._sites_by_uuid: Optional[Dict[uuid.UUID, Dict[str, Any]]] = None

    def _load_json(self, file_path: Path) -> List[Dict[str, Any]]:
        if not file_path.exists():
            raise FileNotFoundError(f"JSON data file not found at {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_all_habitations(self) -> List[Dict[str, Any]]:
        if self._habitations is None:
            raw_habs = self._load_json(HABITATION_SCORES_PATH)
            self._habitations = []
            self._habitations_by_uuid = {}
            for hab in raw_habs:
                if "habitation_id" not in hab:
                    raise ValueError("CRITICAL DATA GAP: Missing 'habitation_id' in habitation_scores.json.")
                    
                hab_id = str(hab["habitation_id"])
                deterministic_id = uuid.uuid5(HABITATION_NAMESPACE, hab_id)
                hab["id"] = deterministic_id
                self._habitations.append(hab)
                self._habitations_by_uuid[deterministic_id] = hab
                
        return self._habitations

    def get_habitation_by_id(self, habitation_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        if self._habitations_by_uuid is None:
            self.get_all_habitations()
        return self._habitations_by_uuid.get(habitation_id)

    def get_all_sites(self) -> List[Dict[str, Any]]:
        if self._sites is None:
            raw_sites = self._load_json(SITE_SCORES_PATH)
            self._sites = []
            self._sites_by_uuid = {}
            for site in raw_sites:
                if "site_id" not in site:
                    raise ValueError("CRITICAL DATA GAP: Missing 'site_id' in site_scores.json.")
                
                if "capacity_people" not in site:
                    logger.warning(
                        f"CRITICAL DATA GAP: site_scores.json is missing 'capacity_people' for site {site.get('site_id')}. "
                        "Setting capacity to None."
                    )
                    site["capacity_people"] = None
                    site["available_capacity"] = None
                    
                site_id_str = str(site["site_id"])
                deterministic_id = uuid.uuid5(SITE_NAMESPACE, site_id_str)
                site["id"] = deterministic_id
                self._sites.append(site)
                self._sites_by_uuid[deterministic_id] = site
        return self._sites

    def get_site_by_id(self, site_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        if self._sites_by_uuid is None:
            self.get_all_sites()
        return self._sites_by_uuid.get(site_id)

json_data_service = JSONDataService()
