"""Data-completeness and epistemic confidence scoring system."""

from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd

HABITATION_REQUIRED_FIELDS = [
    "population",
    "slope_degree",
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
    """Return a 50–100 confidence score driven by input completeness.

    Preserves backward compatibility for baseline score calculations.
    """
    available = pd.DataFrame(
        {
            field: (
                frame[field].notna()
                if field in frame
                else pd.Series(False, index=frame.index)
            )
            for field in required_fields
        }
    )
    completeness = available.mean(axis=1)
    return (50.0 + 50.0 * completeness).round(1)


def calculate_system_confidence(
    frame: pd.DataFrame,
    predicted_probabilities: Optional[np.ndarray | pd.Series] = None,
    has_live_telemetry: bool = False,
    verification_weight: float = 0.85,
) -> pd.Series:
    """Calculate epistemic confidence accounting for uncertainty & telemetry.

    Components:
    - Input Completeness (0.50 weight)
    - Prediction Certainty / Margin from decision boundary (0.30 weight)
    - Telemetry Freshness & Ground Truth Verification (0.20 weight)
    """
    completeness = calculate_confidence(frame, HABITATION_REQUIRED_FIELDS) / 100.0

    if predicted_probabilities is not None:
        p = np.asarray(predicted_probabilities)
        # Margin of certainty: distance from maximum uncertainty (0.5)
        certainty = 2.0 * np.abs(p - 0.5)
    else:
        certainty = 0.5

    telemetry_boost = 0.15 if has_live_telemetry else 0.0

    system_conf = (
        0.50 * completeness
        + 0.30 * certainty
        + 0.20 * verification_weight
        + telemetry_boost
    )
    # Clip between 30% and 90%
    clipped = np.clip(system_conf * 100.0, 30.0, 90.0).round(1)
    return pd.Series(clipped, index=frame.index)
