import abc
import pandas as pd
from typing import Dict, Any, List

class WeatherProvider(abc.ABC):
    @abc.abstractmethod
    def get_status(self) -> Dict[str, str]:
        """Return provider name, status (CONNECTED, NOT_CONFIGURED, FAILING)."""
        pass
        
    @abc.abstractmethod
    def fetch_weather(self, habitations_df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
        """
        Takes a dataframe of habitations (with latitude/longitude) and returns a dict
        mapping habitation_id -> weather features:
        {
            "timestamp": str (ISO8601 UTC),
            "rainfall_24h": float,
            "rainfall_3day": float,
            "rainfall_7day": float,
            "temperature": float,
            "humidity": float,
            "source": str
        }
        """
        pass

class RiverProvider(abc.ABC):
    @abc.abstractmethod
    def get_status(self) -> Dict[str, str]:
        """Return provider name, status (CONNECTED, NOT_CONFIGURED, FAILING)."""
        pass
        
    @abc.abstractmethod
    def fetch_river_levels(self, habitations_df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
        """
        Takes a dataframe of habitations and returns a dict mapping habitation_id -> river features.
        """
        pass

