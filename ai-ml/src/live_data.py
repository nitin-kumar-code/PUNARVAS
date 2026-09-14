"""Live data architecture: telemetry adapters and data streaming interfaces."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import pandas as pd

from .data_loader import load_river_levels, load_satellite_data, load_weather_history
from .feature_engineering import (
    compute_river_features_for_date,
    compute_weather_features_for_date,
)

logger = logging.getLogger(__name__)


@dataclass
class EnvironmentalTelemetry:
    """Standardized snapshot of incoming environmental sensor readings."""

    latitude: float
    longitude: float
    timestamp: str
    rainfall_24h: float
    rainfall_3day: float
    rainfall_7day: float
    temperature: float
    humidity: float
    river_level: float
    threshold_exceedance: float
    level_change_1h: float
    level_change_6h: float
    source: str = "telemetry_feed"

    def to_dict(self) -> dict[str, Any]:
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timestamp": self.timestamp,
            "rainfall_24h": self.rainfall_24h,
            "rainfall_3day": self.rainfall_3day,
            "rainfall_7day": self.rainfall_7day,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "river_level": self.river_level,
            "threshold_exceedance": self.threshold_exceedance,
            "level_change_1h": self.level_change_1h,
            "level_change_6h": self.level_change_6h,
            "source": self.source,
        }


class LiveDataProvider:
    """Data interface providing live or historical replay environmental telemetry."""

    def __init__(self, data_dir: Optional[str | Path] = None) -> None:
        self.weather_df = load_weather_history(data_dir)
        self.river_df = load_river_levels(data_dir)
        self.satellite_df = load_satellite_data(data_dir)

    def fetch_latest_observation(
        self,
        latitude: float,
        longitude: float,
        target_date: Optional[str | pd.Timestamp] = None,
    ) -> EnvironmentalTelemetry:
        """Fetch situational observations for a geographic coordinate."""
        t_date = (
            pd.to_datetime(target_date)
            if target_date
            else self.weather_df["timestamp"].max()
        )
        w_feats = compute_weather_features_for_date(
            latitude, longitude, t_date, self.weather_df
        )
        r_feats = compute_river_features_for_date(
            latitude, longitude, t_date, self.river_df
        )

        return EnvironmentalTelemetry(
            latitude=latitude,
            longitude=longitude,
            timestamp=str(t_date),
            rainfall_24h=w_feats["rainfall_24h"],
            rainfall_3day=w_feats["rainfall_3day"],
            rainfall_7day=w_feats["rainfall_7day"],
            temperature=w_feats["temperature"],
            humidity=w_feats["humidity"],
            river_level=r_feats["river_level"],
            threshold_exceedance=r_feats["threshold_exceedance"],
            level_change_1h=r_feats["level_change_1h"],
            level_change_6h=r_feats["level_change_6h"],
            source="historical_replay" if target_date else "latest_station_feed",
        )
