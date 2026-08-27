"""Suitability and safety scoring for candidate relocation sites."""

from __future__ import annotations

import pandas as pd


# Baselines are deliberately explicit rather than inferred from the shortlist.
# They should be reviewed with engineers and local authorities before use on a
# different relocation programme.
CAPACITY_TARGETS = {
    "land_capacity": 2_000.0,
    "water_capacity": 600.0,
    "power_capacity": 600.0,
    "healthcare_capacity": 50.0,
    "school_capacity": 150.0,
}


def capacity_score(frame: pd.DataFrame, column: str) -> pd.Series:
    """Convert a capacity value to 0–100 against a fixed reviewable target."""
    values = pd.to_numeric(
        frame.get(column, pd.Series(0, index=frame.index)), errors="coerce"
    ).fillna(0).clip(lower=0)
    return (100 * values / CAPACITY_TARGETS[column]).clip(0, 100)


def calculate_site_safety(frame: pd.DataFrame) -> pd.Series:
    """Return a 0–100 safety/suitability score; higher is better.

    It deliberately makes hazard avoidance almost half the score while also
    considering essential infrastructure and access to livelihoods.
    """
    hazard = pd.to_numeric(frame.get("hazard_score", pd.Series(100, index=frame.index)), errors="coerce")
    hazard = hazard.fillna(100).clip(0, 100)
    hazard_avoidance = 100 - hazard
    road = pd.to_numeric(
        frame.get("road_access", pd.Series(0, index=frame.index)), errors="coerce"
    ).fillna(0).clip(0, 100)
    land = capacity_score(frame, "land_capacity")
    water = capacity_score(frame, "water_capacity")
    power = capacity_score(frame, "power_capacity")
    healthcare = capacity_score(frame, "healthcare_capacity")
    school = capacity_score(frame, "school_capacity")
    livelihood = pd.to_numeric(
        frame.get("livelihood_access", pd.Series(0, index=frame.index)), errors="coerce"
    ).fillna(0).clip(0, 100)

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
