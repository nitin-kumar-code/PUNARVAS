"""Operational triage categories and recommended action prioritization."""

from __future__ import annotations

import pandas as pd

TRIAGE_ACTIONS = {
    "Critical": (
        "Initiate immediate field verification and emergency preparedness planning."
    ),
    "High": (
        "Prioritise detailed assessment and mitigation planning in the next"
        " review cycle."
    ),
    "Moderate": (
        "Monitor seasonal triggers and include in routine resilience planning."
    ),
    "Low": "Maintain standard monitoring and refresh data annually.",
}

PRIORITY_MAPPING = {
    "Critical": "P1",
    "High": "P2",
    "Moderate": "P3",
    "Low": "P4",
}

PRIORITY_DESCRIPTIONS = {
    "P1": "P1 — Immediate attention",
    "P2": "P2 — High priority",
    "P3": "P3 — Moderate priority",
    "P4": "P4 — Monitor",
}


def assign_triage(risk_score: pd.Series) -> pd.Series:
    """Map 0–100 risk scores to an action-oriented priority tier."""
    return pd.cut(
        risk_score,
        bins=[-float("inf"), 38, 48, 55, float("inf")],
        labels=["Low", "Moderate", "High", "Critical"],
        right=False,
    ).astype("string")


def assign_priority_code(triage_or_score: pd.Series | str | float) -> pd.Series | str:
    """Map triage levels or risk scores to operational priority levels."""
    if isinstance(triage_or_score, pd.Series):
        if pd.api.types.is_numeric_dtype(triage_or_score):
            triage_tier = assign_triage(triage_or_score)
        else:
            triage_tier = triage_or_score
        return triage_tier.map(PRIORITY_MAPPING).fillna("P4").astype("string")

    if isinstance(triage_or_score, (int, float)):
        triage_str = str(assign_triage(pd.Series([triage_or_score])).iloc[0])
        return PRIORITY_MAPPING.get(triage_str, "P4")

    return PRIORITY_MAPPING.get(str(triage_or_score), "P4")


def recommended_action(triage_level: str) -> str:
    """Return specific emergency management action for triage tier."""
    return TRIAGE_ACTIONS.get(triage_level, "Review the available data before action.")
