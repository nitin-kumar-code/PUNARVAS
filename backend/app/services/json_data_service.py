import json
import os
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
HABITATION_SCORES_PATH = PROJECT_ROOT / "ai-ml" / "outputs" / "habitation_scores.json"
SITE_SCORES_PATH = PROJECT_ROOT / "ai-ml" / "outputs" / "site_scores.json"

HABITATION_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

class JSONDataService:
    def __init__(self):
        self._habitations: Optional[List[Dict[str, Any]]] = None
        self._habitations_by_uuid: Optional[Dict[uuid.UUID, Dict[str, Any]]] = None
        self._sites: Optional[List[Dict[str, Any]]] = None

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
                # Generate collision-resistant UUID5
                hab_id = hab.get("habitation_id", 0)
                deterministic_id = uuid.uuid5(HABITATION_NAMESPACE, str(hab_id))
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
            self._sites = self._load_json(SITE_SCORES_PATH)
        return self._sites

    def get_site_by_id(self, site_id: str) -> Optional[Dict[str, Any]]:
        sites = self.get_all_sites()
        for site in sites:
            if site.get("site_id") == site_id:
                return site
        return None

json_data_service = JSONDataService()
