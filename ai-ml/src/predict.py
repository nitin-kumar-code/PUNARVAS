"""Calibrated prediction service for flood and landslide risk."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Optional

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


def _enrich_habitations_with_features(
    habitations_df: pd.DataFrame,
    data_dir: Optional[str | Path] = None,
) -> pd.DataFrame:
    """Assemble the full feature set required by ML models.

    Joins habitations with terrain, soil, satellite, weather, and river data
    using the same feature engineering functions used during training.

    This solves the training/inference feature mismatch where habitations.csv
    only contains ~7 of the 22-28 features the models expect, and the missing
    features were being silently zero-filled — producing saturated predictions.
    """
    from .data_loader import (
        get_data_dir,
        load_river_levels,
        load_satellite_data,
        load_soil_data,
        load_terrain_features,
        load_weather_history,
    )
    from .feature_engineering import (
        extract_geomorphology_features,
        extract_soil_features,
        find_nearest_station,
    )

    dir_path = Path(data_dir) if data_dir else get_data_dir()

    # Work on a copy to avoid mutating the caller's DataFrame
    df = habitations_df.copy()
    if df.index.name == "habitation_id":
        df = df.reset_index()
    hab_ids = df["habitation_id"].values

    # ── 1. Join terrain features ──────────────────────────────────────────
    terrain = load_terrain_features(dir_path)
    terrain_map = terrain.set_index("habitation_id")
    terrain_cols = [
        "elevation_m", "slope_degree", "aspect_degree", "curvature",
        "roughness", "flow_accumulation", "drainage_density",
        "distance_to_river_km", "distance_to_stream_km",
        "topographic_wetness_index", "relative_relief",
    ]
    for col in terrain_cols:
        if col not in df.columns:
            df[col] = np.nan
    for idx, row in df.iterrows():
        hid = row["habitation_id"]
        if hid in terrain_map.index:
            t_row = terrain_map.loc[hid]
            feats = extract_geomorphology_features(t_row)
            for k, v in feats.items():
                df.at[idx, k] = v

    # ── 2. Join soil features ─────────────────────────────────────────────
    soil = load_soil_data(dir_path)
    soil_map = soil.set_index("habitation_id")
    soil_cols = [
        "soil_moisture", "soil_depth_cm", "clay_pct", "sand_pct",
        "soil_stability_index",
    ]
    for col in soil_cols:
        if col not in df.columns:
            df[col] = np.nan
    for idx, row in df.iterrows():
        hid = row["habitation_id"]
        if hid in soil_map.index:
            s_row = soil_map.loc[hid]
            feats = extract_soil_features(s_row)
            for k, v in feats.items():
                df.at[idx, k] = v

    # ── 3. Join satellite features (latest observation per habitation) ────
    satellite = load_satellite_data(dir_path)
    satellite["timestamp"] = pd.to_datetime(satellite["timestamp"])
    # Get the most recent observation per habitation
    sat_latest = (
        satellite.sort_values("timestamp")
        .drop_duplicates(subset=["habitation_id"], keep="last")
        .set_index("habitation_id")
    )
    sat_col_map = {
        "water_extent_pct": "sat_water_extent_pct",
        "vegetation_index": "sat_vegetation_index",
        "surface_change_score": "sat_surface_change_score",
        "landslide_change_score": "sat_landslide_change_score",
        "flood_inundation_flag": "sat_flood_inundation_flag",
    }
    for target_col in sat_col_map.values():
        if target_col not in df.columns:
            df[target_col] = np.nan
    for idx, row in df.iterrows():
        hid = row["habitation_id"]
        if hid in sat_latest.index:
            s_row = sat_latest.loc[hid]
            for src_col, tgt_col in sat_col_map.items():
                val = s_row.get(src_col)
                if val is not None and not (isinstance(val, float) and pd.isna(val)):
                    df.at[idx, tgt_col] = float(val)
                else:
                    # Use the same defaults as in feature_engineering.py
                    defaults = {
                        "sat_water_extent_pct": 0.0,
                        "sat_vegetation_index": 0.5,
                        "sat_surface_change_score": 0.0,
                        "sat_landslide_change_score": 0.0,
                        "sat_flood_inundation_flag": 0.0,
                    }
                    df.at[idx, tgt_col] = defaults.get(tgt_col, 0.0)

    # ── 4. Compute baseline weather features ──────────────────────────────
    # For batch/static risk assessment without a specific event date, we use
    # the climatological baseline (median values) from the nearest weather
    # station. This matches the training data's non-disaster samples which
    # also used calm-period weather observations.
    weather = load_weather_history(dir_path)
    weather_cols = [
        "rainfall_24h", "rainfall_3day", "rainfall_7day", "rainfall_anomaly",
        "temperature", "humidity", "pressure_hpa", "wind_speed_ms",
    ]
    for col in weather_cols:
        if col not in df.columns:
            df[col] = np.nan

    if not weather.empty:
        # Compute per-station baseline statistics
        weather["date"] = pd.to_datetime(weather["timestamp"]).dt.normalize()
        unique_stations = weather.drop_duplicates(
            subset=["latitude", "longitude"]
        ).copy()

        for idx, row in df.iterrows():
            lat = float(row.get("latitude", 0))
            lon = float(row.get("longitude", 0))
            nearest = find_nearest_station(lat, lon, unique_stations)
            n_lat, n_lon = nearest["latitude"], nearest["longitude"]

            stn_weather = weather[
                (weather["latitude"] == n_lat) & (weather["longitude"] == n_lon)
            ]
            if stn_weather.empty:
                stn_weather = weather

            # Median rainfall per day as baseline
            daily_rain = stn_weather.groupby("date")["rainfall_mm"].sum()
            r_24h = float(daily_rain.median()) if not daily_rain.empty else 0.0
            r_3d = r_24h * 3.0  # Approximate 3-day accumulation
            r_7d = r_24h * 7.0  # Approximate 7-day accumulation
            r_anomaly = 0.0  # Baseline = no anomaly by definition

            temp = (
                float(stn_weather["temperature_c"].median())
                if "temperature_c" in stn_weather.columns
                and not stn_weather["temperature_c"].isna().all()
                else 20.0
            )
            humid = (
                float(stn_weather["humidity_pct"].median())
                if "humidity_pct" in stn_weather.columns
                and not stn_weather["humidity_pct"].isna().all()
                else 65.0
            )
            pressure = (
                float(stn_weather["pressure_hpa"].median())
                if "pressure_hpa" in stn_weather.columns
                and not stn_weather["pressure_hpa"].isna().all()
                else 850.0
            )
            wind = (
                float(stn_weather["wind_speed_ms"].median())
                if "wind_speed_ms" in stn_weather.columns
                and not stn_weather["wind_speed_ms"].isna().all()
                else 2.0
            )

            df.at[idx, "rainfall_24h"] = round(r_24h, 2)
            df.at[idx, "rainfall_3day"] = round(r_3d, 2)
            df.at[idx, "rainfall_7day"] = round(r_7d, 2)
            df.at[idx, "rainfall_anomaly"] = round(r_anomaly, 2)
            df.at[idx, "temperature"] = round(temp, 1)
            df.at[idx, "humidity"] = round(humid, 1)
            df.at[idx, "pressure_hpa"] = round(pressure, 1)
            df.at[idx, "wind_speed_ms"] = round(wind, 1)

    # ── 5. Compute baseline river features ────────────────────────────────
    river = load_river_levels(dir_path)
    river_cols = [
        "river_level", "threshold_exceedance", "level_change_1h",
        "level_change_3h", "level_change_6h", "flow_cumecs",
        "river_level_percentile",
    ]
    for col in river_cols:
        if col not in df.columns:
            df[col] = np.nan

    if not river.empty:
        unique_stations = river.drop_duplicates(subset=["station_id"]).copy()
        for idx, row in df.iterrows():
            lat = float(row.get("latitude", 0))
            lon = float(row.get("longitude", 0))
            nearest = find_nearest_station(lat, lon, unique_stations)
            stn_id = nearest["station_id"]

            stn_river = river[river["station_id"] == stn_id]
            if stn_river.empty:
                stn_river = river

            # Use median water level as baseline (typical conditions)
            w_level = float(stn_river["water_level_m"].median())
            d_level = float(stn_river["danger_level_m"].median())
            exceedance = max(0.0, w_level - d_level)

            # Baseline: no rapid changes (calm conditions)
            c_1h = float(stn_river["level_change_1h"].median()) if "level_change_1h" in stn_river.columns and not stn_river["level_change_1h"].isna().all() else 0.0
            c_3h = float(stn_river["level_change_3h"].median()) if "level_change_3h" in stn_river.columns and not stn_river["level_change_3h"].isna().all() else 0.0
            c_6h = float(stn_river["level_change_6h"].median()) if "level_change_6h" in stn_river.columns and not stn_river["level_change_6h"].isna().all() else 0.0
            flow = float(stn_river["flow_cumecs"].median()) if "flow_cumecs" in stn_river.columns and not stn_river["flow_cumecs"].isna().all() else 0.0
            pct = float((stn_river["water_level_m"] <= w_level).mean() * 100.0)

            df.at[idx, "river_level"] = round(w_level, 2)
            df.at[idx, "threshold_exceedance"] = round(exceedance, 2)
            df.at[idx, "level_change_1h"] = round(c_1h, 2)
            df.at[idx, "level_change_3h"] = round(c_3h, 2)
            df.at[idx, "level_change_6h"] = round(c_6h, 2)
            df.at[idx, "flow_cumecs"] = round(flow, 1)
            df.at[idx, "river_level_percentile"] = round(pct, 1)

    # ── 6. Ensure distance_to_fault_km is present ─────────────────────────
    if "distance_to_fault_km" not in df.columns:
        df["distance_to_fault_km"] = 5.0

    # Log feature completeness check
    all_needed = set(FLOOD_FEATURES) | set(LANDSLIDE_FEATURES)
    still_missing = [f for f in all_needed if f not in df.columns]
    if still_missing:
        logger.warning(
            "After enrichment, %d features still missing: %s",
            len(still_missing), still_missing,
        )

    # Re-index by habitation_id for consistency with caller expectations
    if "habitation_id" in df.columns:
        df = df.set_index("habitation_id")

    logger.info(
        "Feature enrichment complete. Shape: %s. "
        "Flood features present: %d/%d, Landslide features present: %d/%d",
        df.shape,
        sum(1 for f in FLOOD_FEATURES if f in df.columns), len(FLOOD_FEATURES),
        sum(1 for f in LANDSLIDE_FEATURES if f in df.columns), len(LANDSLIDE_FEATURES),
    )
    return df


def predict_hazards_batch_enriched(
    habitations_df: pd.DataFrame,
    data_dir: Optional[str | Path] = None,
) -> pd.DataFrame:
    """Perform batch predictions after enriching habitations with all required features.

    This is the correct entry point for batch inference from habitations.csv,
    which only contains static/geographic features. This function joins in
    terrain, soil, satellite, weather, and river data to assemble the full
    feature set that the models were trained on, then runs prediction.
    """
    enriched_df = _enrich_habitations_with_features(habitations_df, data_dir)
    return predict_hazards_batch(enriched_df)
