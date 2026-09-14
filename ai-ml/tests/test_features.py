"""Tests for feature engineering and spatial-temporal utilities."""

from __future__ import annotations

import pandas as pd

from src.feature_engineering import (
    compute_river_features_for_date,
    compute_weather_features_for_date,
    extract_geomorphology_features,
    find_nearest_station,
    haversine_distance_km,
)


def test_haversine_distance_km() -> None:
    # Approx distance between Joshimath (30.5564, 79.5672) and
    # Chamoli (30.4082, 79.3254) is ~28-30 km
    dist = haversine_distance_km(30.5564, 79.5672, 30.4082, 79.3254)
    assert 25.0 < dist < 35.0
    # Zero distance
    assert haversine_distance_km(30.0, 79.0, 30.0, 79.0) == 0.0


def test_find_nearest_station() -> None:
    stations = pd.DataFrame(
        {
            "station_id": ["S1", "S2"],
            "latitude": [30.40, 30.60],
            "longitude": [79.40, 79.60],
        }
    )
    nearest = find_nearest_station(30.41, 79.41, stations)
    assert nearest["station_id"] == "S1"


def test_compute_weather_features_for_date() -> None:
    weather_df = pd.DataFrame(
        {
            "timestamp": [
                "2023-07-11 08:30:00",
                "2023-07-12 08:30:00",
                "2023-07-13 08:30:00",
            ],
            "latitude": [30.40, 30.40, 30.40],
            "longitude": [79.40, 79.40, 79.40],
            "rainfall_mm": [20.0, 50.0, 80.0],
            "temperature_c": [22.0, 20.0, 18.0],
            "humidity_pct": [70.0, 85.0, 95.0],
        }
    )
    target = pd.Timestamp("2023-07-13")
    res = compute_weather_features_for_date(30.40, 79.40, target, weather_df)
    assert res["rainfall_24h"] == 80.0
    assert res["rainfall_3day"] == 150.0
    assert res["humidity"] == 95.0


def test_compute_river_features_for_date() -> None:
    river_df = pd.DataFrame(
        {
            "timestamp": ["2023-07-13 06:00:00", "2023-07-13 07:00:00"],
            "station_id": ["STN-1", "STN-1"],
            "latitude": [30.40, 30.40],
            "longitude": [79.40, 79.40],
            "water_level_m": [1002.0, 1006.0],
            "danger_level_m": [1005.0, 1005.0],
            "flow_cumecs": [200.0, 450.0],
            "level_change_1h": [0.5, 4.0],
            "level_change_3h": [1.0, 6.0],
            "level_change_6h": [2.0, 8.0],
        }
    )
    target = pd.Timestamp("2023-07-13")
    res = compute_river_features_for_date(30.40, 79.40, target, river_df)
    assert res["river_level"] == 1006.0
    assert res["threshold_exceedance"] == 1.0  # 1006 - 1005
    assert res["level_change_6h"] == 8.0


def test_extract_geomorphology_features() -> None:
    row = pd.Series(
        {
            "elevation_m": 2100.0,
            "slope_degree": 32.5,
            "aspect_degree": 140.0,
            "curvature": -1.2,
            "roughness": 18.5,
            "flow_accumulation": 1200,
            "drainage_density": 2.5,
            "distance_to_river_km": 0.35,
            "distance_to_stream_km": 0.12,
            "topographic_wetness_index": 11.2,
            "relative_relief": 950.0,
        }
    )
    feats = extract_geomorphology_features(row)
    assert feats["elevation_m"] == 2100.0
    assert feats["slope_degree"] == 32.5
    assert feats["distance_to_river_km"] == 0.35
