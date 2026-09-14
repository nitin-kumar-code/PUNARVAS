"""Suitability and safety scoring for candidate relocation sites."""

from __future__ import annotations

from typing import Any

import pandas as pd

CAPACITY_TARGETS = {
    "land_capacity": 2_000.0,
    "water_capacity": 600.0,
    "power_capacity": 600.0,
    "healthcare_capacity": 50.0,
    "school_capacity": 150.0,
}


def capacity_score(frame: pd.DataFrame, column: str) -> pd.Series:
    """Convert a capacity value to 0–100 against a fixed target.

    Supports 'land_capacity' and 'land_capacity_people'.
    """
    col_people = f"{column}_people"
    if col_people in frame.columns:
        vals = frame[col_people]
    else:
        vals = frame.get(column, pd.Series(0, index=frame.index))
    values = pd.to_numeric(vals, errors="coerce").fillna(0).clip(lower=0)
    return (100.0 * values / CAPACITY_TARGETS[column]).clip(0, 100)


def calculate_site_safety(frame: pd.DataFrame) -> pd.Series:
    """Return a 0–100 safety/suitability score; higher is better."""
    fallback_h = pd.Series(100, index=frame.index)
    hazard = (
        pd.to_numeric(frame.get("hazard_score", fallback_h), errors="coerce")
        .fillna(100)
        .clip(0, 100)
    )
    hazard_avoidance = 100 - hazard
    road = (
        pd.to_numeric(
            frame.get("road_access", pd.Series(0, index=frame.index)),
            errors="coerce",
        )
        .fillna(0)
        .clip(0, 100)
    )
    land = capacity_score(frame, "land_capacity")
    water = capacity_score(frame, "water_capacity")
    power = capacity_score(frame, "power_capacity")
    healthcare = capacity_score(frame, "healthcare_capacity")
    school = capacity_score(frame, "school_capacity")
    livelihood = (
        pd.to_numeric(
            frame.get("livelihood_access", pd.Series(0, index=frame.index)),
            errors="coerce",
        )
        .fillna(0)
        .clip(0, 100)
    )

    return (
        0.40 * hazard_avoidance
        + 0.12 * road
        + 0.10 * land
        + 0.10 * water
        + 0.10 * power
        + 0.08 * healthcare
        + 0.05 * school
        + 0.05 * livelihood
    ).round(2)


def assign_site_tier(site_safety_score: pd.Series) -> pd.Series:
    """Assign a practical recommendation tier for each candidate site."""
    return pd.cut(
        site_safety_score,
        bins=[-float("inf"), 50, 60, float("inf")],
        labels=["Avoid", "Conditional", "Preferred"],
        right=False,
    ).astype("string")


def evaluate_rehabilitation_site(
    site_record: dict[str, Any] | pd.Series,
    predicted_flood_prob: float = 0.0,
    predicted_landslide_prob: float = 0.0,
) -> dict[str, Any]:
    """Evaluate candidate rehabilitation site under predicted ML risk."""
    if isinstance(site_record, pd.Series):
        row = site_record.to_dict()
    else:
        row = dict(site_record)
    safety_df = pd.DataFrame([row])
    safety_score = float(calculate_site_safety(safety_df).iloc[0])

    max_hazard_prob = max(predicted_flood_prob, predicted_landslide_prob)

    if safety_score >= 60.0 and max_hazard_prob < 0.25:
        category = "SAFE"
        verdict = (
            "Lower predicted risk under available data. "
            "Recommended for priority engineering site survey."
        )
    elif safety_score >= 45.0 and max_hazard_prob < 0.50:
        category = "CAUTION"
        verdict = (
            "Moderate suitability; conditional on geotechnical "
            "reinforcement and flood barrier mitigation."
        )
    else:
        category = "UNSAFE"
        verdict = (
            "Elevated composite hazard or severe infrastructure deficit. "
            "Site relocation not recommended."
        )

    return {
        "site_id": row.get("site_id"),
        "site_name": row.get("site_name"),
        "site_safety_score": safety_score,
        "site_recommendation": category,
        "verdict_narrative": verdict,
        "predicted_flood_prob": predicted_flood_prob,
        "predicted_landslide_prob": predicted_landslide_prob,
    }
