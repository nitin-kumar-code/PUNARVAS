"""Explainable ML module providing feature attribution for predictions."""

from __future__ import annotations

import logging
from typing import Any


from .predict import predict_hazard_single
from .train_flood import FLOOD_FEATURES
from .train_landslide import LANDSLIDE_FEATURES

logger = logging.getLogger(__name__)

FEATURE_NARRATIVES = {
    "rainfall_24h": ("rainfall in past 24h", "mm"),
    "rainfall_3day": ("cumulative 3-day rainfall", "mm"),
    "rainfall_7day": ("cumulative 7-day rainfall", "mm"),
    "rainfall_anomaly": ("rainfall anomaly above station median", "mm"),
    "pressure_hpa": ("barometric atmospheric pressure", "hPa"),
    "wind_speed_ms": ("wind velocity", "m/s"),
    "river_level": ("river water level", "m"),
    "threshold_exceedance": ("river danger level exceedance", "m"),
    "level_change_1h": ("1-hour river rise rate", "m/h"),
    "level_change_6h": ("6-hour river surge rate", "m/6h"),
    "flow_cumecs": ("river discharge volume", "cumecs"),
    "river_level_percentile": ("river level percentile", "%"),
    "sat_water_extent_pct": ("satellite observed surface water extent", "%"),
    "sat_surface_change_score": ("satellite ground deformation score", ""),
    "sat_landslide_change_score": ("satellite debris slip score", ""),
    "sat_flood_inundation_flag": ("satellite confirmed flood inundation", ""),
    "elevation_m": ("elevation", "m"),
    "slope_degree": ("terrain slope", "°"),
    "curvature": ("slope curvature", ""),
    "roughness": ("terrain roughness", ""),
    "distance_to_river_km": ("distance to primary river", "km"),
    "distance_to_stream_km": ("distance to drainage stream", "km"),
    "topographic_wetness_index": ("topographic wetness index (TWI)", ""),
    "relative_relief": ("relative relief", "m"),
    "soil_stability_index": ("geotechnical soil stability index", ""),
    "soil_moisture": ("soil volumetric moisture", "%"),
    "clay_pct": ("clay content in soil", "%"),
    "distance_to_fault_km": ("proximity to tectonic fault line", "km"),
    "population": ("settlement population exposure", "people"),
    "dilapidated_house_pct": ("dilapidated housing vulnerability", "%"),
    "temporary_house_pct": ("temporary structures vulnerability", "%"),
    "hospital_distance_km": ("hospital access distance", "km"),
}


def explain_prediction_factors(
    features_dict: dict[str, Any],
    hazard_type: str = "flood",
    top_k: int = 4,
) -> list[dict[str, Any]]:
    """Determine top contributing factors driving a specific prediction."""
    feature_list = FLOOD_FEATURES if hazard_type == "flood" else LANDSLIDE_FEATURES
    contributions = []

    for feat in feature_list:
        val = float(features_dict.get(feat, 0.0))
        label, unit = FEATURE_NARRATIVES.get(feat, (feat.replace("_", " "), ""))

        score = 0.0
        if "rainfall" in feat and val > 50.0:
            score = (val / 100.0) * 2.5
        elif feat == "threshold_exceedance" and val > 0.0:
            score = val * 3.0
        elif feat == "level_change_6h" and val > 1.0:
            score = val * 2.0
        elif feat == "sat_water_extent_pct" and val > 10.0:
            score = (val / 20.0) * 3.5
        elif feat == "sat_flood_inundation_flag" and val > 0.0:
            score = 4.0
        elif feat == "sat_landslide_change_score" and val > 30.0:
            score = (val / 50.0) * 4.0
        elif feat == "sat_surface_change_score" and val > 30.0:
            score = (val / 50.0) * 3.0
        elif feat == "slope_degree" and val > 25.0:
            score = (val / 45.0) * 2.2
        elif feat == "soil_moisture" and val > 40.0:
            score = (val / 60.0) * 2.0
        elif feat == "distance_to_river_km" and val < 0.5:
            score = (0.5 - val) * 4.0
        elif feat == "soil_stability_index" and val < 0.4:
            score = (0.4 - val) * 5.0
        elif feat == "distance_to_fault_km" and val < 2.0:
            score = (2.0 - val) * 1.5

        if score > 0.1:
            formatted_val = (
                f"{val:.1f} {unit}".strip() if unit else f"{val:.2f}".strip()
            )
            contributions.append(
                {
                    "feature": feat,
                    "label": label,
                    "value": formatted_val,
                    "contribution_score": round(score, 2),
                    "reason": f"Elevated {label} ({formatted_val})",
                }
            )

    contributions.sort(key=lambda x: x["contribution_score"], reverse=True)
    return contributions[:top_k]


def format_explainable_assessment(
    location_name: str,
    features_dict: dict[str, Any],
    model_version: str = "v1.0",
) -> str:
    """Format full human-readable PUNARVAS risk explanation."""
    pred = predict_hazard_single(features_dict)
    flood_reasons = explain_prediction_factors(features_dict, "flood", top_k=2)
    landslide_reasons = explain_prediction_factors(features_dict, "landslide", top_k=2)
    all_reasons = flood_reasons + landslide_reasons

    lines = [
        "PUNARVAS RISK ASSESSMENT",
        "",
        f"Location: {location_name}",
        f"Flood Probability: {pred['flood_probability'] * 100:.1f}%",
        f"Flood Risk: {pred['flood_risk']}",
        f"Landslide Probability: {pred['landslide_probability'] * 100:.1f}%",
        f"Landslide Risk: {pred['landslide_risk']}",
        f"Overall Hazard: {pred['overall_risk']}",
        "",
        "Main Contributing Factors:",
    ]

    if all_reasons:
        for i, item in enumerate(all_reasons[:4], 1):
            lines.append(f"{i}. {item['reason']}")
    else:
        lines.append("1. Environmental and terrain conditions within normal limits.")

    lines.extend(
        [
            "",
            "Model: Multi-Sensor Calibrated Ensemble (GBM & LogReg)",
            f"Model Version: {model_version}",
        ]
    )
    return "\n".join(lines)
