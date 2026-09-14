"""Dynamic Risk Engine: Real-time risk updates on sensor telemetry."""

from __future__ import annotations

import logging
from typing import Any, Optional

import pandas as pd

from .predict import predict_hazard_single
from .triage import assign_triage

logger = logging.getLogger(__name__)


def _safe_float(val: Any, default: float = 0.0) -> float:
    """Safely convert value to float, handling None, NaN, pd.NA, and invalid types."""
    if val is None:
        return default
    try:
        if pd.isna(val):
            return default
        return float(val)
    except (ValueError, TypeError):
        return default


def _to_clean_dict(data: Any) -> dict[str, Any]:
    """Convert telemetry (dict, pd.Series, or object) into a clean dictionary.

    Excludes None and NaN values so they do not overwrite existing valid baseline features.
    """
    if data is None:
        return {}

    cleaned: dict[str, Any] = {}

    if isinstance(data, pd.Series):
        for k, v in data.items():
            if v is not None and not (isinstance(v, float) and pd.isna(v)):
                cleaned[str(k)] = v
    elif isinstance(data, dict):
        for k, v in data.items():
            if v is not None and not (isinstance(v, float) and pd.isna(v)):
                cleaned[str(k)] = v
    elif hasattr(data, "to_dict"):
        fn = getattr(data, "to_dict")
        if callable(fn):
            res = fn()
            if isinstance(res, dict):
                for k, v in res.items():
                    if v is not None and not (isinstance(v, float) and pd.isna(v)):
                        cleaned[str(k)] = v

    return cleaned


def calculate_dynamic_risk_single(
    habitation_record: dict[str, Any] | pd.Series,
    current_weather: Optional[dict[str, Any] | pd.Series | Any] = None,
    current_river: Optional[dict[str, Any] | pd.Series | Any] = None,
) -> dict[str, Any]:
    """Calculate situational dynamic risk from baseline and live sensor data.

    Returns baseline risk, dynamic risk, risk delta, trend,
    flood and landslide probabilities, dynamic triage level, and alerts.
    """
    row: dict[str, Any] = {}
    if isinstance(habitation_record, pd.Series):
        row = {str(k): v for k, v in habitation_record.items()}
    elif isinstance(habitation_record, dict):
        row = {str(k): v for k, v in habitation_record.items()}
    else:
        try:
            row = {str(k): v for k, v in dict(habitation_record).items()}
        except Exception:
            row = {}

    # Baseline risk
    base_risk = _safe_float(row.get("risk_score"), 40.0)

    # Merge dynamic updates
    dynamic_features: dict[str, Any] = dict(row)
    weather_dict = _to_clean_dict(current_weather)
    river_dict = _to_clean_dict(current_river)

    has_telemetry = bool(weather_dict or river_dict)
    if weather_dict:
        dynamic_features.update(weather_dict)
    if river_dict:
        dynamic_features.update(river_dict)

    # ML Inference on situational features
    try:
        preds: dict[str, Any] = predict_hazard_single(dynamic_features)
    except Exception as e:
        logger.error("Dynamic hazard inference error: %s", e)
        preds = {}

    flood_prob = _safe_float(preds.get("flood_probability"), 0.0)
    landslide_prob = _safe_float(preds.get("landslide_probability"), 0.0)
    flood_tier = str(preds.get("flood_risk", "LOW"))
    landslide_tier = str(preds.get("landslide_risk", "LOW"))

    # Active environmental alerts
    alerts: list[str] = []
    r_24h = _safe_float(dynamic_features.get("rainfall_24h"), 0.0)
    exceedance = _safe_float(dynamic_features.get("threshold_exceedance"), 0.0)
    c_6h = _safe_float(dynamic_features.get("level_change_6h"), 0.0)
    slope = _safe_float(dynamic_features.get("slope_degree"), 20.0)

    if r_24h >= 100.0:
        alerts.append("EXTREME_RAINFALL_WARNING")
    elif r_24h >= 60.0:
        alerts.append("HEAVY_RAINFALL_ADVISORY")

    if exceedance > 0.0:
        alerts.append(f"RIVER_DANGER_LEVEL_EXCEEDED (+{exceedance:.1f}m)")

    if c_6h >= 2.0:
        alerts.append("RAPID_RIVER_SURGE_DETECTED")

    if r_24h >= 80.0 and slope >= 30.0:
        alerts.append("HIGH_LANDSLIDE_SLOPE_INSTABILITY")

    # Situational hazard computation
    max_hazard_prob = max(flood_prob, landslide_prob)
    situational_hazard = max_hazard_prob * 100.0

    if has_telemetry:
        dyn_risk = round(0.50 * situational_hazard + 0.50 * base_risk, 2)
    else:
        dyn_risk = base_risk

    delta = round(dyn_risk - base_risk, 2)
    if delta >= 5.0:
        trend = "RISING"
    elif delta <= -5.0:
        trend = "FALLING"
    else:
        trend = "STABLE"

    try:
        triage_series = assign_triage(pd.Series([dyn_risk]))
        triage_tier = str(triage_series.iloc[0])
    except Exception as e:
        logger.error("Error assigning triage tier: %s", e)
        triage_tier = "Moderate"

    return {
        "habitation_id": row.get("habitation_id"),
        "village_name": row.get("village_name", "Unknown"),
        "baseline_risk": base_risk,
        "dynamic_risk": dyn_risk,
        "risk_delta": delta,
        "trend": trend,
        "flood_probability": flood_prob,
        "landslide_probability": landslide_prob,
        "flood_risk": flood_tier,
        "landslide_risk": landslide_tier,
        "dynamic_triage_level": triage_tier,
        "active_alerts": alerts,
    }


def update_habitations_dynamic_risk(
    habitations_df: pd.DataFrame,
    weather_updates: Optional[pd.DataFrame | dict[Any, Any]] = None,
    river_updates: Optional[pd.DataFrame | dict[Any, Any]] = None,
) -> pd.DataFrame:
    """Recalculate dynamic risk across habitations given latest telemetry."""
    if habitations_df.empty:
        return pd.DataFrame()

    weather_df_indexed: Optional[pd.DataFrame] = None
    if isinstance(weather_updates, pd.DataFrame):
        if "habitation_id" in weather_updates.columns:
            weather_df_indexed = weather_updates.set_index("habitation_id")
        else:
            weather_df_indexed = weather_updates

    river_df_indexed: Optional[pd.DataFrame] = None
    if isinstance(river_updates, pd.DataFrame):
        if "habitation_id" in river_updates.columns:
            river_df_indexed = river_updates.set_index("habitation_id")
        else:
            river_df_indexed = river_updates

    results: list[dict[str, Any]] = []
    for _, hab in habitations_df.iterrows():
        hid: Any = hab["habitation_id"]

        w_dict: Optional[dict[str, Any]] = None
        if isinstance(weather_updates, dict):
            if hid in weather_updates:
                w_val = weather_updates[hid]
                if isinstance(w_val, dict):
                    w_dict = {str(k): v for k, v in w_val.items()}
                elif isinstance(w_val, pd.Series):
                    w_dict = {str(k): v for k, v in w_val.items()}
            elif any(k in weather_updates for k in ["rainfall_24h", "rainfall_3day"]):
                w_dict = {str(k): v for k, v in weather_updates.items()}
        elif weather_df_indexed is not None and hid in weather_df_indexed.index:
            w_entry = weather_df_indexed.loc[hid]
            if isinstance(w_entry, pd.DataFrame):
                w_dict = {str(k): v for k, v in w_entry.iloc[-1].items()}
            elif isinstance(w_entry, pd.Series):
                w_dict = {str(k): v for k, v in w_entry.items()}

        r_dict: Optional[dict[str, Any]] = None
        if isinstance(river_updates, dict):
            if hid in river_updates:
                r_val = river_updates[hid]
                if isinstance(r_val, dict):
                    r_dict = {str(k): v for k, v in r_val.items()}
                elif isinstance(r_val, pd.Series):
                    r_dict = {str(k): v for k, v in r_val.items()}
            elif any(
                k in river_updates
                for k in ["river_level", "threshold_exceedance"]
            ):
                r_dict = {str(k): v for k, v in river_updates.items()}
        elif river_df_indexed is not None and hid in river_df_indexed.index:
            r_entry = river_df_indexed.loc[hid]
            if isinstance(r_entry, pd.DataFrame):
                r_dict = {str(k): v for k, v in r_entry.iloc[-1].items()}
            elif isinstance(r_entry, pd.Series):
                r_dict = {str(k): v for k, v in r_entry.items()}

        res = calculate_dynamic_risk_single(
            hab, current_weather=w_dict, current_river=r_dict
        )
        results.append(res)

    return pd.DataFrame(results)
