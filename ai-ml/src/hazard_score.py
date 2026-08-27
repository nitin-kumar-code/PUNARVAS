"""Hazard scoring from landslide, flood, terrain, and historical-event data."""

from __future__ import annotations

import pandas as pd


def _numeric(frame: pd.DataFrame, column: str, default: float = 0.0) -> pd.Series:
    """Return a numeric column, using *default* where data is unavailable."""
    if column not in frame:
        return pd.Series(default, index=frame.index, dtype="float64")
    return pd.to_numeric(frame[column], errors="coerce").fillna(default)


def calculate_hazard_score(frame: pd.DataFrame) -> pd.Series:
    """Return a 0–100 hazard score for each habitation.

    The weights favour directly observed landslide and flood risk, then add
    historical events and terrain steepness.  All components are capped to
    keep the output interpretable and bounded.
    """
    landslide = _numeric(frame, "landslide_score").clip(0, 100)
    flood = _numeric(frame, "flood_score").clip(0, 100)
    event_count = (
        _numeric(frame, "historical_landslide_count")
        + _numeric(frame, "historical_flood_count")
    ).clip(0, 4)
    historical = event_count / 4 * 100
    slope = (_numeric(frame, "slope_degree") / 45 * 100).clip(0, 100)

    return (0.35 * landslide + 0.25 * flood + 0.20 * historical + 0.20 * slope).round(2)
