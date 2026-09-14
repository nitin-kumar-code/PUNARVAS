"""Calibrated prediction service for flood and landslide risk."""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

from .model_utils import get_models_dir, load_model, validate_input_features
from .train_flood import FLOOD_FEATURES
from .train_landslide import LANDSLIDE_FEATURES

logger = logging.getLogger(__name__)

# Singleton cached model instances
_FLOOD_MODEL = None
_LANDSLIDE_MODEL = None


def get_flood_model() -> Any:
    """Retrieve or lazy-load the calibrated flood model."""
    global _FLOOD_MODEL
    if _FLOOD_MODEL is None:
        path = get_models_dir() / "flood_model.pkl"
        _FLOOD_MODEL = load_model(path)
    return _FLOOD_MODEL


def get_landslide_model() -> Any:
    """Retrieve or lazy-load the calibrated landslide model."""
    global _LANDSLIDE_MODEL
    if _LANDSLIDE_MODEL is None:
        path = get_models_dir() / "landslide_model.pkl"
        _LANDSLIDE_MODEL = load_model(path)
    return _LANDSLIDE_MODEL


def probability_to_risk_tier(prob: float) -> str:
    """Convert calibrated probability into operational risk bands."""
    if prob >= 0.75:
        return "CRITICAL"
    if prob >= 0.50:
        return "HIGH"
    if prob >= 0.25:
        return "MODERATE"
    return "LOW"


def combine_hazard_tiers(flood_tier: str, landslide_tier: str) -> str:
    """Determine composite overall risk level from component risk tiers."""
    order = ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    f_idx = order.index(flood_tier) if flood_tier in order else 0
    l_idx = order.index(landslide_tier) if landslide_tier in order else 0
    return order[max(f_idx, l_idx)]


def predict_hazard_single(input_data: dict[str, Any] | pd.Series) -> dict[str, Any]:
    """Perform calibrated risk prediction on an environmental record."""
    if isinstance(input_data, dict):
        df = pd.DataFrame([input_data])
    else:
        df = pd.DataFrame([input_data.to_dict()])

    flood_clf = get_flood_model()
    landslide_clf = get_landslide_model()

    X_flood = validate_input_features(df, FLOOD_FEATURES)
    X_landslide = validate_input_features(df, LANDSLIDE_FEATURES)

    try:
        flood_prob = float(flood_clf.predict_proba(X_flood)[0, 1])
    except Exception as e:
        logger.error("Flood prediction error: %s", e)
        flood_prob = 0.0

    try:
        landslide_prob = float(landslide_clf.predict_proba(X_landslide)[0, 1])
    except Exception as e:
        logger.error("Landslide prediction error: %s", e)
        landslide_prob = 0.0

    flood_tier = probability_to_risk_tier(flood_prob)
    landslide_tier = probability_to_risk_tier(landslide_prob)
    overall_tier = combine_hazard_tiers(flood_tier, landslide_tier)

    return {
        "flood_probability": round(flood_prob, 3),
        "landslide_probability": round(landslide_prob, 3),
        "flood_risk": flood_tier,
        "landslide_risk": landslide_tier,
        "overall_risk": overall_tier,
    }


def predict_hazards_batch(df: pd.DataFrame) -> pd.DataFrame:
    """Perform batch risk predictions for a DataFrame of locations."""
    flood_clf = get_flood_model()
    landslide_clf = get_landslide_model()

    X_flood = validate_input_features(df, FLOOD_FEATURES)
    X_landslide = validate_input_features(df, LANDSLIDE_FEATURES)

    flood_probs = flood_clf.predict_proba(X_flood)[:, 1]
    landslide_probs = landslide_clf.predict_proba(X_landslide)[:, 1]

    results = df.copy()
    results["flood_probability"] = np.round(flood_probs, 3)
    results["landslide_probability"] = np.round(landslide_probs, 3)
    results["flood_risk"] = [probability_to_risk_tier(p) for p in flood_probs]
    results["landslide_risk"] = [probability_to_risk_tier(p) for p in landslide_probs]
    results["overall_risk"] = [
        combine_hazard_tiers(f_tier, l_tier)
        for f_tier, l_tier in zip(results["flood_risk"], results["landslide_risk"])
    ]
    return results
