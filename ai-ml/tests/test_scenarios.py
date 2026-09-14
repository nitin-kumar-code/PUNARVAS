"""Scenario tests for score direction, thresholds, and output integrity."""

from __future__ import annotations

import pandas as pd

from src.hazard_score import calculate_hazard_score
from src.preprocessing import validate_columns
from src.risk_engine import score_candidate_sites, score_habitations
from src.triage import assign_triage


def test_hazard_score_increases_with_landslide_and_flood_risk() -> None:
    frame = pd.DataFrame(
        {
            "landslide_score": [10, 80],
            "flood_score": [10, 80],
            "historical_landslide_count": [0, 3],
            "historical_flood_count": [0, 1],
            "slope_degree": [5, 40],
        }
    )
    scores = calculate_hazard_score(frame)
    scores_list = list(scores)
    assert scores_list[1] > scores_list[0]
    assert scores.between(0, 100).all()


def test_triage_thresholds_are_actionable() -> None:
    triage = assign_triage(pd.Series([37.9, 38.0, 48.0, 55.0]))
    assert triage.tolist() == ["Low", "Moderate", "High", "Critical"]


def test_higher_hazard_reduces_site_safety() -> None:
    common = {
        "slope_degree": [10, 10],
        "road_access": [90, 90],
        "water_capacity": [500, 500],
        "power_capacity": [500, 500],
        "healthcare_capacity": [50, 50],
        "school_capacity": [100, 100],
        "livelihood_access": [80, 80],
    }
    sites = pd.DataFrame({**common, "hazard_score": [20, 80]})
    scores = score_candidate_sites(sites)
    safety_scores = list(scores["site_safety_score"])
    assert safety_scores[0] > safety_scores[1]


def test_site_capacity_score_does_not_depend_on_shortlist_membership() -> None:
    site = pd.DataFrame(
        {
            "hazard_score": [40],
            "land_capacity": [2_000],
            "water_capacity": [600],
            "power_capacity": [600],
            "healthcare_capacity": [50],
            "school_capacity": [150],
            "road_access": [80],
            "livelihood_access": [80],
        }
    )
    isolated_scores = list(score_candidate_sites(site)["site_safety_score"])
    doubled = pd.concat([site, site], ignore_index=True)
    compared_scores = list(score_candidate_sites(doubled)["site_safety_score"])
    assert isolated_scores[0] == compared_scores[0]


def test_habitation_output_contains_explanation_and_confidence() -> None:
    habitations = pd.DataFrame(
        {
            "population": [150],
            "population_density_per_km2": [600],
            "children_0_6": [18],
            "landslide_score": [70],
            "flood_score": [60],
            "historical_landslide_count": [2],
            "historical_flood_count": [1],
            "slope_degree": [35],
            "temporary_house_pct": [20],
            "dilapidated_house_pct": [20],
            "hospital_distance_km": [8],
            "healthcare_capacity_est": [10],
        }
    )
    scored = score_habitations(habitations)
    row = dict(scored.iloc[0])
    assert 0 <= row["risk_score"] <= 100
    assert 50 <= row["confidence_score"] <= 100
    explanation = str(row["explanation"])
    assert "Key drivers:" in explanation
    assert "high composite hazard" in explanation


def test_schema_validation_names_missing_columns() -> None:
    frame = pd.DataFrame({"available": [1]})
    try:
        validate_columns(frame, {"available", "missing"}, "example.csv")
    except ValueError as error:
        assert "missing" in str(error)
        assert "example.csv" in str(error)
    else:
        raise AssertionError("Expected schema validation to fail")
