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
    assert scores.iloc[1] > scores.iloc[0]
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
    scored = score_candidate_sites(sites)
    assert scored.loc[0, "site_safety_score"] > scored.loc[1, "site_safety_score"]


def test_site_capacity_score_does_not_depend_on_shortlist_membership() -> None:
    site = pd.DataFrame(
        {
            "hazard_score": [40], "land_capacity": [2_000], "water_capacity": [600],
            "power_capacity": [600], "healthcare_capacity": [50], "school_capacity": [150],
            "road_access": [80], "livelihood_access": [80],
        }
    )
    isolated_score = score_candidate_sites(site).loc[0, "site_safety_score"]
    compared_score = score_candidate_sites(pd.concat([site, site], ignore_index=True)).loc[0, "site_safety_score"]
    assert isolated_score == compared_score


def test_habitation_output_contains_explanation_and_confidence() -> None:
    habitations = pd.DataFrame(
        {
            "population": [150], "population_density_per_km2": [600], "children_0_6": [18],
            "landslide_score": [70], "flood_score": [60], "historical_landslide_count": [2],
            "historical_flood_count": [1], "slope_degree": [35], "temporary_house_pct": [20],
            "dilapidated_house_pct": [20], "hospital_distance_km": [8],
            "healthcare_capacity_est": [10],
        }
    )
    scored = score_habitations(habitations)
    assert 0 <= scored.loc[0, "risk_score"] <= 100
    assert 50 <= scored.loc[0, "confidence_score"] <= 100
    assert "Key drivers:" in scored.loc[0, "explanation"]
    assert "high composite hazard" in scored.loc[0, "explanation"]


def test_schema_validation_names_missing_columns() -> None:
    frame = pd.DataFrame({"available": [1]})
    try:
        validate_columns(frame, {"available", "missing"}, "example.csv")
    except ValueError as error:
        assert "missing" in str(error)
        assert "example.csv" in str(error)
    else:
        raise AssertionError("Expected schema validation to fail")
