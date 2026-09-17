from typing import Dict, Any
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
from src.live_data import LiveDataProvider
import sys

class HistoricalReplayProvider:
    """
    Fallback provider wrapping the original ai-ml logic.
    Always uses the max timestamp available in the CSVs to simulate 'current' conditions of the replay.
    """
    def __init__(self, data_dir: str):
        self.provider_name = "HISTORICAL_REPLAY"
        self.data_dir = data_dir
        
        # We need to import the old logic directly to maintain behavior
        PROJECT_ROOT = Path(data_dir).parent.parent
        if str(PROJECT_ROOT / "ai-ml") not in sys.path:
            sys.path.insert(0, str(PROJECT_ROOT / "ai-ml"))
            
        from src.live_data import LiveDataProvider
        self._provider = LiveDataProvider(data_dir)
        
    def get_status(self) -> Dict[str, str]:
        return {
            "Provider": self.provider_name,
            "Status": "ACTIVE",
            "Last error": "None"
        }
        
    def fetch_observations(self, habitations_df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
        results = {}
        for hid, row in habitations_df.iterrows():
            obs = self._provider.fetch_latest_observation(
                latitude=row.get("latitude", 0.0),
                longitude=row.get("longitude", 0.0)
            )
            d = obs.to_dict()
            d["source"] = "historical_replay"
            results[hid] = d
        return results

