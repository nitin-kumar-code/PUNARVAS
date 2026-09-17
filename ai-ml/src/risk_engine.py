"""Unified risk engine for RULE_BASED, ML_BASED, and HYBRID modes."""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np
import pandas as pd

try:
    from .confidence import (
        HABITATION_REQUIRED_FIELDS,
        SITE_REQUIRED_FIELDS,
        calculate_confidence,
    )
    from .explain import explain_habitation, explain_site
    from .exposure_score import calculate_exposure_score
    from .hazard_score import calculate_hazard_score
    from .site_safety import assign_site_tier, calculate_site_safety
    from .triage import assign_triage
    from .vulnerability_score import calculate_vulnerability_score
except ImportError:
    from confidence import (
        HABITATION_REQUIRED_FIELDS,
        SITE_REQUIRED_FIELDS,
        calculate_confidence,
    )
    from explain import explain_habitation, explain_site
    from exposure_score import calculate_exposure_score
    from hazard_score import calculate_hazard_score
    from site_safety import assign_site_tier, calculate_site_safety
    from triage import assign_triage
    from vulnerability_score import calculate_vulnerability_score

logger = logging.getLogger(__name__)


def score_habitations(
    habitations: pd.DataFrame,
    mode: Optional[str] = None,
    ml_weight: float = 0.55,
    reference_now: Optional[str] = None,
) -> pd.DataFrame:
    """Score habitations using RULE_BASED, ML_BASED, or HYBRID mode.

    Modes:
    - RULE_BASED: Traditional formula (Hazard 45%, Exposure 30%, Vuln 25%).
    - ML_BASED: Calibrated ML hazard models drive the hazard component.
    - HYBRID: Blends ML probabilistic predictions with rule-based hazard.
      If dynamic telemetry is absent, defaults to physical hazard baseline.
    """
    from .predict import predict_hazards_batch
    from .dynamic_math import compute_dynamic_hazard, evaluate_telemetry_state

    scored = habitations.copy()

    # Determine mode: if not specified, HYBRID if telemetry, else RULE_BASED
    has_telemetry = "rainfall_24h" in scored.columns or "river_level" in scored.columns
    if mode is None:
        effective_mode = "HYBRID" if has_telemetry else "RULE_BASED"
    else:
        effective_mode = mode.upper().strip()

    # 1. Compute foundational component scores
    rule_hazard = calculate_hazard_score(scored)
    exposure_comp = calculate_exposure_score(scored)
    vuln_comp = calculate_vulnerability_score(scored)

    # 2. Run ML Hazard Inference
    try:
        preds = predict_hazards_batch(scored)
        scored["flood_probability"] = preds["flood_probability"]
        scored["landslide_probability"] = preds["landslide_probability"]
        scored["flood_risk"] = preds["flood_risk"]
        scored["landslide_risk"] = preds["landslide_risk"]
        scored["ml_overall_risk"] = preds["overall_risk"]
    except Exception as e:
        logger.warning("ML hazard prediction bypassed (%s). Falling back to rules.", e)
        scored["flood_probability"] = 0.0
        scored["landslide_probability"] = 0.0
        scored["flood_risk"] = "LOW"
        scored["landslide_risk"] = "LOW"
        scored["ml_overall_risk"] = "LOW"

    from .dynamic_math import compute_dynamic_hazard, evaluate_telemetry_state

    def _apply_dynamic_hazard(row: pd.Series) -> pd.Series:
        # Check required features for live telemetry
        req = ["rainfall_24h", "river_level", "timestamp"]
        if not all(c in row.index for c in req):
            state = "MISSING"
        elif pd.isna(row["rainfall_24h"]) or pd.isna(row["river_level"]):
            state = "INVALID"
        else:
            try:
                float(row["rainfall_24h"])
                float(row["river_level"])
                state = evaluate_telemetry_state(row.get("timestamp"), reference_now=reference_now)
            except (ValueError, TypeError):
                state = "INVALID"
        
        pf = row.get("flood_probability", 0.0)
        pl = row.get("landslide_probability", 0.0)
        h_stat = row.get("_rule_hazard_internal", 0.0)
        
        h_fin, p_any = compute_dynamic_hazard(h_stat, pf, pl, state)
        return pd.Series({"hazard_component": h_fin, "p_any": p_any, "telemetry_state": state})

    # 3. Mode Selection
    if effective_mode == "RULE_BASED":
        scored["hazard_component"] = rule_hazard
        scored["telemetry_state"] = "IGNORED"
        scored["p_any"] = p_any
    elif effective_mode == "ML_BASED":
        # Note: Do not silently misrepresent event probability as static susceptibility.
        p_f = np.clip(scored["flood_probability"].fillna(0.0), 0.0, 1.0)
        p_l = np.clip(scored["landslide_probability"].fillna(0.0), 0.0, 1.0)
        p_any = 1.0 - ((1.0 - p_f) * (1.0 - p_l))
        scored["hazard_component"] = (p_any * 100.0).round(2)
        scored["telemetry_state"] = "IGNORED"
        scored["p_any"] = p_any
    else:  # HYBRID
        scored["_rule_hazard_internal"] = rule_hazard
        res = scored.apply(_apply_dynamic_hazard, axis=1)
        scored["hazard_component"] = res["hazard_component"]
        scored["telemetry_state"] = res["telemetry_state"]
        scored["p_any"] = res["p_any"]
        scored.drop(columns=["_rule_hazard_internal"], inplace=True)

    scored["exposure_component"] = exposure_comp
    scored["vulnerability_component"] = vuln_comp

    scored["risk_score"] = (
        0.45 * scored["hazard_component"]
        + 0.30 * scored["exposure_component"]
        + 0.25 * scored["vulnerability_component"]
    ).round(2)

    scored["triage_level"] = assign_triage(scored["risk_score"])
    scored["confidence_score"] = calculate_confidence(
        scored, HABITATION_REQUIRED_FIELDS
    )
    scored["explanation"] = scored.apply(explain_habitation, axis=1)
    scored["scoring_mode"] = effective_mode
    return scored


def score_candidate_sites(
    candidate_sites: pd.DataFrame,
    mode: Optional[str] = None,
) -> pd.DataFrame:
    """Score candidate sites without using safe flag as a model feature."""
    from .predict import predict_hazards_batch

    scored = candidate_sites.copy()
    has_telemetry = "rainfall_24h" in scored.columns or "river_level" in scored.columns
    if mode is None:
        effective_mode = "HYBRID" if has_telemetry else "RULE_BASED"
    else:
        effective_mode = mode.upper().strip()

    try:
        site_preds = predict_hazards_batch(scored)
        scored["predicted_flood_probability"] = site_preds["flood_probability"]
        scored["predicted_landslide_probability"] = site_preds["landslide_probability"]
        scored["predicted_overall_hazard"] = site_preds["overall_risk"]
        max_site_p = np.maximum(
            site_preds["flood_probability"],
            site_preds["landslide_probability"],
        )
        ml_site_hazard = (max_site_p * 100.0).round(2)
    except Exception as e:
        logger.warning("Site ML hazard inference fallback: %s", e)
        default_hazard = scored.get("hazard_score", 50.0)
        ml_site_hazard = pd.to_numeric(default_hazard, errors="coerce").fillna(50.0)

    if effective_mode == "ML_BASED":
        scored["hazard_score"] = ml_site_hazard
    elif (
        effective_mode == "HYBRID"
        and has_telemetry
        and "hazard_score" in scored.columns
    ):
        scored["hazard_score"] = (
            0.5 * scored["hazard_score"] + 0.5 * ml_site_hazard
        ).round(2)

    scored["site_safety_score"] = calculate_site_safety(scored)
    scored["site_risk_score"] = (100.0 - scored["site_safety_score"]).round(2)
    scored["site_tier"] = assign_site_tier(scored["site_safety_score"])
    scored["confidence_score"] = calculate_confidence(scored, SITE_REQUIRED_FIELDS)
    scored["explanation"] = scored.apply(explain_site, axis=1)
    scored["scoring_mode"] = effective_mode
    return scored
