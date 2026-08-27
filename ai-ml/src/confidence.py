"""Data-completeness confidence scoring."""

from __future__ import annotations

import pandas as pd


HABITATION_REQUIRED_FIELDS = [
    "population",
    "slope_degree",
    "landslide_score",
    "flood_score",
    "hospital_distance_km",
    "temporary_house_pct",
    "dilapidated_house_pct",
]

SITE_REQUIRED_FIELDS = [
    "hazard_score",
    "slope_degree",
    "road_access",
    "water_capacity",
    "power_capacity",
    "healthcare_capacity",
    "school_capacity",
    "livelihood_access",
]


def calculate_confidence(frame: pd.DataFrame, required_fields: list[str]) -> pd.Series:
    """Return a 50–100 confidence score driven solely by input completeness."""
    available = pd.DataFrame(
        {
            field: frame[field].notna() if field in frame else pd.Series(False, index=frame.index)
            for field in required_fields
        }
    )
    completeness = available.mean(axis=1)
    return (50 + 50 * completeness).round(1)
