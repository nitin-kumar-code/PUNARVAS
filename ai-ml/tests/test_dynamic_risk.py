"""Tests for dynamic risk calculations and alerts."""

from __future__ import annotations

import pandas as pd

from src.dynamic_risk import (
    calculate_dynamic_risk_single,
    update_habitations_dynamic_risk,
)


def test_dynamic_risk_increases_with_extreme_weather() -> None:
    baseline_hab = {
        "habitation_id": 40971,
        "village_name": "Birahi",
        "risk_score": 42.0,
        "slope_degree": 30.0,
        "elevation_m": 1200.0,
        "distance_to_river_km": 0.1,
    }
    calm_weather = {"rainfall_24h": 0.0, "rainfall_3day": 0.0}
    extreme_weather = {
        "rainfall_24h": 175.0,
        "rainfall_3day": 240.0,
        "threshold_exceedance": 2.5,
    }

    calm_res = calculate_dynamic_risk_single(baseline_hab, current_weather=calm_weather)
    surge_res = calculate_dynamic_risk_single(
        baseline_hab, current_weather=extreme_weather
    )

    assert "EXTREME_RAINFALL_WARNING" in surge_res["active_alerts"]
    assert surge_res["dynamic_risk"] >= calm_res["dynamic_risk"]
    assert surge_res["dynamic_triage_level"] in ["Low", "Moderate", "High", "Critical"]


def test_dynamic_risk_handles_missing_telemetry() -> None:
    hab = {"habitation_id": 9999, "risk_score": 45.0}
    res = calculate_dynamic_risk_single(hab)
    assert res["dynamic_risk"] == 45.0
    assert res["trend"] == "STABLE"
    assert res["risk_delta"] == 0.0


def test_update_habitations_dynamic_risk_batch() -> None:
    habs = pd.DataFrame(
        [
            {"habitation_id": 1, "village_name": "A", "risk_score": 35.0},
            {"habitation_id": 2, "village_name": "B", "risk_score": 52.0},
        ]
    )
    weather_dict = {
        1: {"rainfall_24h": 120.0},
        2: {"rainfall_24h": 10.0},
    }
    updated = update_habitations_dynamic_risk(habs, weather_updates=weather_dict)
    assert len(updated) == 2
    assert "trend" in updated.columns
    assert "active_alerts" in updated.columns


def test_dynamic_risk_handles_none_and_nan_telemetry() -> None:
    hab = {
        "habitation_id": 100,
        "village_name": "TestVillage",
        "risk_score": None,
        "rainfall_24h": None,
        "threshold_exceedance": float("nan"),
        "level_change_6h": None,
        "slope_degree": None,
    }
    weather = {
        "rainfall_24h": None,
        "temperature": "25.0",
    }
    river = {
        "threshold_exceedance": None,
        "level_change_6h": float("nan"),
    }
    res = calculate_dynamic_risk_single(hab, current_weather=weather, current_river=river)
    assert res["habitation_id"] == 100
    assert res["baseline_risk"] == 40.0
    assert isinstance(res["dynamic_risk"], float)
    assert isinstance(res["active_alerts"], list)


def test_dynamic_risk_handles_series_input() -> None:
    hab = pd.Series({"habitation_id": 200, "risk_score": 50.0})
    weather_series = pd.Series({"rainfall_24h": 110.0})
    river_series = pd.Series({"threshold_exceedance": 1.2, "level_change_6h": 2.5})

    res = calculate_dynamic_risk_single(
        hab, current_weather=weather_series, current_river=river_series
    )
    assert res["habitation_id"] == 200
    assert "EXTREME_RAINFALL_WARNING" in res["active_alerts"]
    assert "RAPID_RIVER_SURGE_DETECTED" in res["active_alerts"]
    assert any("RIVER_DANGER_LEVEL_EXCEEDED" in a for a in res["active_alerts"])


def test_update_habitations_dynamic_risk_with_dataframes() -> None:
    habs = pd.DataFrame(
        [
            {"habitation_id": 1, "village_name": "VillageA", "risk_score": 35.0},
            {"habitation_id": 2, "village_name": "VillageB", "risk_score": 50.0},
        ]
    )
    weather_df = pd.DataFrame(
        [
            {"habitation_id": 1, "rainfall_24h": 130.0},
            {"habitation_id": 2, "rainfall_24h": 5.0},
        ]
    )
    river_df = pd.DataFrame(
        [
            {"habitation_id": 1, "threshold_exceedance": 1.5},
            {"habitation_id": 2, "threshold_exceedance": 0.0},
        ]
    )
    updated = update_habitations_dynamic_risk(
        habs, weather_updates=weather_df, river_updates=river_df
    )
    assert len(updated) == 2
    res_hab1 = updated[updated["habitation_id"] == 1].iloc[0]
    assert "EXTREME_RAINFALL_WARNING" in res_hab1["active_alerts"]
