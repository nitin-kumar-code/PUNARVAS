import requests
import logging
import pandas as pd
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from .base import WeatherProvider

logger = logging.getLogger(__name__)

class OpenMeteoWeatherProvider(WeatherProvider):
    """
    Real external weather provider using Open-Meteo.
    Grid-maps habitations to 0.1 degree resolution (approx 11km) to reduce API calls.
    """
    def __init__(self):
        self.provider_name = "Open-Meteo"
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        # Since this is an open API, we check if we can reach it.
        self._connected = False
        self._last_success = None
        self._last_error = None
        self._check_connection()

    def _check_connection(self):
        try:
            # simple ping
            resp = requests.get(f"{self.base_url}?latitude=28.6&longitude=77.2&current_weather=true", timeout=5)
            if resp.status_code == 200:
                self._connected = True
                self._last_success = datetime.now(timezone.utc).isoformat()
            else:
                self._connected = False
                self._last_error = f"HTTP {resp.status_code}"
        except Exception as e:
            self._connected = False
            self._last_error = str(e)

    def get_status(self) -> Dict[str, str]:
        return {
            "Provider": self.provider_name,
            "Status": "CONNECTED" if self._connected else "FAILS_TO_CONNECT",
            "Last successful fetch": self._last_success or "N/A",
            "Last error": self._last_error or "None"
        }

    def _fetch_grid_data(self, lats: list, lons: list) -> list:
        # OpenMeteo allows up to 100 locations per request in the free tier if comma separated.
        # We query past 7 days to calculate 24h, 3day, 7day rainfall.
        lat_str = ",".join(map(str, lats))
        lon_str = ",".join(map(str, lons))
        url = f"{self.base_url}?latitude={lat_str}&longitude={lon_str}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&past_days=7&forecast_days=1&timezone=UTC"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list):
                    return data
                else:
                    return [data] # single location returns a dict
            else:
                logger.error(f"Open-Meteo error: HTTP {resp.status_code}")
                return []
        except Exception as e:
            logger.error(f"Open-Meteo connection error: {e}")
            return []

    def fetch_weather(self, habitations_df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
        if not self._connected:
            return {}

        # 1. Grid mapping to avoid rate limits
        # Group habitations by 0.1 degree lat/lon
        grid_map = {}
        for idx, row in habitations_df.iterrows():
            grid_lat = round(row["latitude"], 1)
            grid_lon = round(row["longitude"], 1)
            grid_key = (grid_lat, grid_lon)
            if grid_key not in grid_map:
                grid_map[grid_key] = []
            grid_map[grid_key].append(idx)

        grid_keys = list(grid_map.keys())
        results = {}
        
        # 2. Batch requests in chunks of 50
        CHUNK_SIZE = 50
        for i in range(0, len(grid_keys), CHUNK_SIZE):
            chunk = grid_keys[i:i+CHUNK_SIZE]
            lats = [k[0] for k in chunk]
            lons = [k[1] for k in chunk]
            
            provider_data = self._fetch_grid_data(lats, lons)
            if not provider_data:
                continue
                
            self._last_success = datetime.now(timezone.utc).isoformat()
            
            for j, grid_resp in enumerate(provider_data):
                if "daily" not in grid_resp:
                    continue
                daily = grid_resp["daily"]
                precip = daily.get("precipitation_sum", [])
                tmax = daily.get("temperature_2m_max", [])
                tmin = daily.get("temperature_2m_min", [])
                
                # Assume the last item is today/now, previous items are past days
                if len(precip) >= 8:
                    # e.g., 7 past days + 1 forecast day = 8 items
                    # The latest actual observed is precip[-2] or we sum backwards
                    rf_24h = precip[-2] if precip[-2] is not None else 0.0
                    rf_3d = sum(x for x in precip[-4:-1] if x is not None)
                    rf_7d = sum(x for x in precip[-8:-1] if x is not None)
                    temp = ((tmax[-2] or 0.0) + (tmin[-2] or 0.0)) / 2.0
                else:
                    rf_24h, rf_3d, rf_7d, temp = 0.0, 0.0, 0.0, 25.0

                # Map back to habitations
                grid_key = chunk[j]
                hab_ids = grid_map[grid_key]
                for hid in hab_ids:
                    results[hid] = {
                        "timestamp": self._last_success,
                        "rainfall_24h": rf_24h,
                        "rainfall_3day": rf_3d,
                        "rainfall_7day": rf_7d,
                        "temperature": temp,
                        "humidity": 75.0, # Defaulting humidity as daily API doesn't have it easily
                        "source": f"Open-Meteo grid ({grid_key[0]}, {grid_key[1]})"
                    }
                    
        return results

