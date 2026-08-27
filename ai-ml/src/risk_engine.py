"""Combine component scores into risk and candidate-site recommendations."""

from __future__ import annotations

import pandas as pd

try:
    from .confidence import HABITATION_REQUIRED_FIELDS, SITE_REQUIRED_FIELDS, calculate_confidence
    from .exposure_score import calculate_exposure_score
    from .hazard_score import calculate_hazard_score
    from .site_safety import assign_site_tier, calculate_site_safety
    from .triage import assign_triage
    from .vulnerability_score import calculate_vulnerability_score
    from .explain import explain_habitation, explain_site
except ImportError:
    from confidence import HABITATION_REQUIRED_FIELDS, SITE_REQUIRED_FIELDS, calculate_confidence
    from exposure_score import calculate_exposure_score
    from hazard_score import calculate_hazard_score
    from site_safety import assign_site_tier, calculate_site_safety
    from triage import assign_triage
    from vulnerability_score import calculate_vulnerability_score
    from explain import explain_habitation, explain_site


def score_habitations(habitations: pd.DataFrame) -> pd.DataFrame:
    """Score each habitation using hazard (45%), exposure (30%), vulnerability (25%)."""
    scored = habitations.copy()
    scored["hazard_component"] = calculate_hazard_score(scored)
    scored["exposure_component"] = calculate_exposure_score(scored)
    scored["vulnerability_component"] = calculate_vulnerability_score(scored)
    scored["risk_score"] = (
        0.45 * scored["hazard_component"]
        + 0.30 * scored["exposure_component"]
        + 0.25 * scored["vulnerability_component"]
    ).round(2)
    scored["triage_level"] = assign_triage(scored["risk_score"])
    scored["confidence_score"] = calculate_confidence(scored, HABITATION_REQUIRED_FIELDS)
    scored["explanation"] = scored.apply(explain_habitation, axis=1)
    return scored


def score_candidate_sites(candidate_sites: pd.DataFrame) -> pd.DataFrame:
    """Score candidate sites without using the supplied safe flag as a model feature."""
    scored = candidate_sites.copy()
    scored["site_safety_score"] = calculate_site_safety(scored)
    scored["site_risk_score"] = (100 - scored["site_safety_score"]).round(2)
    scored["site_tier"] = assign_site_tier(scored["site_safety_score"])
    scored["confidence_score"] = calculate_confidence(scored, SITE_REQUIRED_FIELDS)
    scored["explanation"] = scored.apply(explain_site, axis=1)
    return scored
