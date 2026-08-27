"""Operational triage categories and recommended actions."""

from __future__ import annotations

import pandas as pd


TRIAGE_ACTIONS = {
    "Critical": "Initiate immediate field verification and emergency preparedness planning.",
    "High": "Prioritise detailed assessment and mitigation planning in the next review cycle.",
    "Moderate": "Monitor seasonal triggers and include in routine resilience planning.",
    "Low": "Maintain standard monitoring and refresh data annually.",
}


def assign_triage(risk_score: pd.Series) -> pd.Series:
    """Map 0–100 risk scores to an action-oriented priority tier."""
    return pd.cut(
        risk_score,
        # These relative thresholds are calibrated to the observed Chamoli
        # distribution; they are prioritisation bands, not disaster-probability
        # forecasts and should be reviewed if the data changes materially.
        bins=[-float("inf"), 38, 48, 55, float("inf")],
        labels=["Low", "Moderate", "High", "Critical"],
        right=False,
    ).astype("string")


def recommended_action(triage_level: str) -> str:
    return TRIAGE_ACTIONS.get(triage_level, "Review the available data before action.")
