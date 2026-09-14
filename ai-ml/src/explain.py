"""Human-readable explanations for scores and recommendation tiers."""

from __future__ import annotations

from typing import Any

import pandas as pd

try:
    from .triage import recommended_action
except ImportError:
    from triage import recommended_action


def _number(value: Any, digits: int = 1) -> str:
    try:
        return f"{float(value):.{digits}f}"
    except (TypeError, ValueError):
        return "not available"


def _as_float(value: Any, default: float = 0.0) -> float:
    """Safely use a possibly missing table value in an explanation rule."""
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return default
    return numeric if pd.notna(numeric) else default


def explain_habitation(row: pd.Series) -> str:
    """Summarise the strongest usable risk drivers and action for one row."""
    drivers: list[str] = []
    if _as_float(row.get("hazard_component", 0)) >= 60:
        drivers.append(
            f"high composite hazard ({_number(row.get('hazard_component'))})"
        )
    if _as_float(row.get("slope_degree", 0)) >= 30:
        drivers.append(f"steep terrain ({_number(row.get('slope_degree'))}°)")
    hist_events = _as_float(row.get("historical_landslide_count", 0)) + _as_float(
        row.get("historical_flood_count", 0)
    )
    if hist_events >= 2:
        drivers.append("repeated recorded hazard events")
    if _as_float(row.get("hospital_distance_km", 0)) >= 5:
        h_dist = _number(row.get("hospital_distance_km"))
        drivers.append(f"long hospital access distance ({h_dist} km)")
    if _as_float(row.get("dilapidated_house_pct", 0)) >= 15:
        d_pct = _number(row.get("dilapidated_house_pct"))
        drivers.append(f"dilapidated housing ({d_pct}%)")
    if not drivers:
        drivers.append(
            "comparatively lower measured hazard and vulnerability indicators"
        )
    action = recommended_action(str(row.get("triage_level", "")))
    return f"Key drivers: {', '.join(drivers[:3])}. {action}"


def explain_site(row: pd.Series) -> str:
    """Summarise the main site suitability drivers for one candidate."""
    strengths: list[str] = []
    if _as_float(row.get("hazard_score", 100), 100) < 50:
        strengths.append("lower relative hazard")
    if _as_float(row.get("road_access", 0)) >= 80:
        strengths.append("strong road access")
    if _as_float(row.get("livelihood_access", 0)) >= 75:
        strengths.append("good livelihood access")
    if _as_float(row.get("healthcare_capacity", 0)) >= 40:
        strengths.append("healthcare capacity")
    if not strengths:
        strengths.append("available capacity factors")
    tier = str(row.get("site_tier", "Unrated"))
    return f"{tier} site: {', '.join(strengths[:3])}."
