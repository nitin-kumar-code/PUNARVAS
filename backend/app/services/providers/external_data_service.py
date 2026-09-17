import os
import pandas as pd
import numpy as np
from typing import Dict, Any
from .open_meteo import OpenMeteoWeatherProvider
from .cwc_river import CWCRiverProvider
from .historical import HistoricalReplayProvider

class ExternalDataService:
    def __init__(self, data_dir: str):
        self.weather_provider = OpenMeteoWeatherProvider()
        self.river_provider = CWCRiverProvider()
        self.historical_fallback = HistoricalReplayProvider(data_dir)
        
        # User explicitly sets this if they want to override.
        # Otherwise, if any provider is CONNECTED, we consider ourselves partially LIVE.
        env_mode = os.environ.get("USE_REAL_PROVIDERS", "auto").lower()
        if env_mode == "false":
            self.mode = "HISTORICAL_REPLAY"
        elif env_mode == "true":
            self.mode = "LIVE"
        else:
            w_status = self.weather_provider.get_status()["Status"]
            r_status = self.river_provider.get_status()["Status"]
            if w_status == "CONNECTED" or r_status == "CONNECTED":
                self.mode = "LIVE"
            else:
                self.mode = "HISTORICAL_REPLAY"

    def get_provider_health(self) -> Dict[str, Any]:
        return {
            "Weather": self.weather_provider.get_status(),
            "River": self.river_provider.get_status(),
            "Fallback": self.historical_fallback.get_status(),
            "Mode": "HISTORICAL REPLAY" if self.mode == "HISTORICAL_REPLAY" else "LIVE"
        }
        
    def fetch_normalized_observations(self, habitations_df: pd.DataFrame) -> pd.DataFrame:
        """
        Fetches data from all configured providers and merges them into a normalized dataframe.
        """
        results = {}
        
        # In LIVE mode, fetch from actual providers.
        # If a provider fails, we insert np.nan as per instruction (no fake fallback).
        if self.mode == "LIVE":
            weather_data = self.weather_provider.fetch_weather(habitations_df)
            river_data = self.river_provider.fetch_river_levels(habitations_df)
            
            for hid, row in habitations_df.iterrows():
                w = weather_data.get(hid)
                r = river_data.get(hid)
                
                obs = {
                    "habitation_id": hid,
                    "rainfall_24h": w["rainfall_24h"] if w else np.nan,
                    "rainfall_3day": w["rainfall_3day"] if w else np.nan,
                    "rainfall_7day": w["rainfall_7day"] if w else np.nan,
                    "temperature": w["temperature"] if w else np.nan,
                    "humidity": w["humidity"] if w else np.nan,
                    "river_level": r["river_level"] if r else np.nan,
                    "threshold_exceedance": r["threshold_exceedance"] if r else np.nan,
                    "level_change_1h": r["level_change_1h"] if r else np.nan,
                    "level_change_6h": r["level_change_6h"] if r else np.nan,
                    "timestamp": w["timestamp"] if w else (r["timestamp"] if r else None),
                    "source": "live_providers"
                }
                results[hid] = obs
                
        else:
            # HISTORICAL_REPLAY mode
            fallback_data = self.historical_fallback.fetch_observations(habitations_df)
            for hid, row in habitations_df.iterrows():
                fb = fallback_data.get(hid, {})
                obs = fb.copy()
                obs["habitation_id"] = hid
                results[hid] = obs
            
        # Convert to DataFrame
        df = pd.DataFrame.from_dict(results, orient="index")
        df.index.name = "habitation_id"
        return df

