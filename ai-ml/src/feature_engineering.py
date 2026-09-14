"""Enhanced feature engineering integrating weather, river, and sensors."""

from __future__ import annotations

import logging

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def haversine_distance_km(
    lat1: float | np.ndarray,
    lon1: float | np.ndarray,
    lat2: float | np.ndarray,
    lon2: float | np.ndarray,
) -> float | np.ndarray:
    """Calculate the great circle distance in kilometers between points."""
    r = 6371.0  # Earth radius in kilometers
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)

    a = (
        np.sin(delta_phi / 2.0) ** 2
        + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
    return r * c


def find_nearest_station(
    lat: float,
    lon: float,
    stations_df: pd.DataFrame,
    lat_col: str = "latitude",
    lon_col: str = "longitude",
) -> pd.Series:
    """Return the nearest station row for a given latitude and longitude."""
    lat_vals = np.asarray(stations_df[lat_col], dtype=float)
    lon_vals = np.asarray(stations_df[lon_col], dtype=float)
    distances = np.asarray(haversine_distance_km(lat, lon, lat_vals, lon_vals))
    min_idx = int(np.argmin(distances))
    result = stations_df.iloc[min_idx].copy()
    result["distance_to_station_km"] = float(distances[min_idx])
    return result


def compute_weather_features_for_date(
    lat: float,
    lon: float,
    target_date: pd.Timestamp,
    weather_df: pd.DataFrame,
) -> dict[str, float]:
    """Calculate 24h, 3d, 7d rainfall, anomaly, temp, humidity, pressure."""
    if weather_df.empty:
        return {
            "rainfall_24h": 0.0,
            "rainfall_3day": 0.0,
            "rainfall_7day": 0.0,
            "rainfall_anomaly": 0.0,
            "temperature": 20.0,
            "humidity": 65.0,
            "pressure_hpa": 850.0,
            "wind_speed_ms": 2.0,
        }

    unique_stations = weather_df.drop_duplicates(
        subset=["latitude", "longitude"]
    ).copy()
    nearest_station = find_nearest_station(lat, lon, unique_stations)
    n_lat = nearest_station["latitude"]
    n_lon = nearest_station["longitude"]

    stn_weather = weather_df[
        (weather_df["latitude"] == n_lat) & (weather_df["longitude"] == n_lon)
    ].copy()
    stn_weather["date"] = pd.to_datetime(stn_weather["timestamp"]).dt.normalize()
    target_norm = pd.to_datetime(target_date).normalize()

    # 24h
    day_0 = stn_weather[stn_weather["date"] == target_norm]
    has_day0 = not day_0.empty
    r_24h = (
        float(day_0["rainfall_mm"].sum())
        if (has_day0 and "rainfall_mm" in day_0.columns)
        else 0.0
    )

    temp = 20.0
    if has_day0 and "temperature_c" in day_0.columns:
        m_t = day_0["temperature_c"].mean()
        if pd.notna(m_t):
            temp = float(m_t)

    humid = 70.0
    if has_day0 and "humidity_pct" in day_0.columns:
        m_h = day_0["humidity_pct"].mean()
        if pd.notna(m_h):
            humid = float(m_h)

    pressure = 850.0
    if has_day0 and "pressure_hpa" in day_0.columns:
        m_p = day_0["pressure_hpa"].mean()
        if pd.notna(m_p):
            pressure = float(m_p)

    wind = 2.5
    if has_day0 and "wind_speed_ms" in day_0.columns:
        m_w = day_0["wind_speed_ms"].mean()
        if pd.notna(m_w):
            wind = float(m_w)

    # 3-day
    d_3_start = target_norm - pd.Timedelta(days=2)
    day_3 = stn_weather[
        (stn_weather["date"] >= d_3_start) & (stn_weather["date"] <= target_norm)
    ]
    r_3d = (
        float(day_3["rainfall_mm"].sum())
        if (not day_3.empty and "rainfall_mm" in day_3.columns)
        else r_24h
    )

    # 7-day
    d_7_start = target_norm - pd.Timedelta(days=6)
    day_7 = stn_weather[
        (stn_weather["date"] >= d_7_start) & (stn_weather["date"] <= target_norm)
    ]
    r_7d = (
        float(day_7["rainfall_mm"].sum())
        if (not day_7.empty and "rainfall_mm" in day_7.columns)
        else r_3d
    )

    # Anomaly vs historical median at this station
    median_rain = (
        float(stn_weather["rainfall_mm"].median())
        if (not stn_weather.empty and "rainfall_mm" in stn_weather.columns)
        else 20.0
    )
    r_anomaly = float(r_24h - median_rain)

    return {
        "rainfall_24h": round(r_24h, 2),
        "rainfall_3day": round(r_3d, 2),
        "rainfall_7day": round(r_7d, 2),
        "rainfall_anomaly": round(r_anomaly, 2),
        "temperature": round(temp, 1),
        "humidity": round(humid, 1),
        "pressure_hpa": round(pressure, 1),
        "wind_speed_ms": round(wind, 1),
    }


def compute_river_features_for_date(
    lat: float,
    lon: float,
    target_date: pd.Timestamp,
    river_df: pd.DataFrame,
) -> dict[str, float]:
    """Calculate gauge level, exceedance above danger level, and surge rate."""
    if river_df.empty:
        return {
            "river_level": 0.0,
            "threshold_exceedance": 0.0,
            "level_change_1h": 0.0,
            "level_change_3h": 0.0,
            "level_change_6h": 0.0,
            "flow_cumecs": 0.0,
            "river_level_percentile": 50.0,
        }

    unique_stations = river_df.drop_duplicates(subset=["station_id"]).copy()
    nearest_station = find_nearest_station(lat, lon, unique_stations)
    stn_id = nearest_station["station_id"]

    stn_river = river_df[river_df["station_id"] == stn_id].copy()
    stn_river["date"] = pd.to_datetime(stn_river["timestamp"]).dt.normalize()
    target_norm = pd.to_datetime(target_date).normalize()

    sub = stn_river[stn_river["date"] == target_norm]
    if not isinstance(sub, pd.DataFrame) or sub.empty:
        sub = stn_river

    if isinstance(sub, pd.DataFrame):
        peak_row = sub.sort_values(by="water_level_m", ascending=False).iloc[0]
    else:
        peak_row = sub.iloc[0]
    w_level = float(peak_row["water_level_m"])
    d_level = float(peak_row.get("danger_level_m", w_level + 5.0))
    exceedance = max(0.0, w_level - d_level)

    c_1h = (
        float(peak_row["level_change_1h"])
        if pd.notna(peak_row.get("level_change_1h"))
        else 0.0
    )
    c_3h = (
        float(peak_row["level_change_3h"])
        if pd.notna(peak_row.get("level_change_3h"))
        else 0.0
    )
    c_6h = (
        float(peak_row["level_change_6h"])
        if pd.notna(peak_row.get("level_change_6h"))
        else 0.0
    )
    flow = (
        float(peak_row["flow_cumecs"]) if pd.notna(peak_row.get("flow_cumecs")) else 0.0
    )
    pct = float((stn_river["water_level_m"] <= w_level).mean() * 100.0)

    return {
        "river_level": round(w_level, 2),
        "threshold_exceedance": round(exceedance, 2),
        "level_change_1h": round(c_1h, 2),
        "level_change_3h": round(c_3h, 2),
        "level_change_6h": round(c_6h, 2),
        "flow_cumecs": round(flow, 1),
        "river_level_percentile": round(pct, 1),
    }


def compute_satellite_features_for_date(
    habitation_id: int,
    target_date: pd.Timestamp | str,
    satellite_df: pd.DataFrame,
) -> dict[str, float]:
    """Query satellite telemetry nearest in time for a settlement."""
    if satellite_df.empty:
        return {
            "sat_water_extent_pct": 0.0,
            "sat_vegetation_index": 0.5,
            "sat_surface_change_score": 0.0,
            "sat_landslide_change_score": 0.0,
            "sat_flood_inundation_flag": 0.0,
        }

    sub = satellite_df[satellite_df["habitation_id"] == habitation_id]
    if sub.empty:
        sub = satellite_df

    td = pd.to_datetime(target_date)
    dates_col = pd.to_datetime(sub["timestamp"])
    time_diffs = (dates_col - td).abs()
    best_row = sub.loc[time_diffs.idxmin()]

    w_extent = (
        float(best_row.get("water_extent_pct", 0.0))
        if pd.notna(best_row.get("water_extent_pct"))
        else 0.0
    )
    veg = (
        float(best_row.get("vegetation_index", 0.5))
        if pd.notna(best_row.get("vegetation_index"))
        else 0.5
    )
    surf_change = (
        float(best_row.get("surface_change_score", 0.0))
        if pd.notna(best_row.get("surface_change_score"))
        else 0.0
    )
    ls_change = (
        float(best_row.get("landslide_change_score", 0.0))
        if pd.notna(best_row.get("landslide_change_score"))
        else 0.0
    )
    flood_flag = (
        float(best_row.get("flood_inundation_flag", 0.0))
        if pd.notna(best_row.get("flood_inundation_flag"))
        else 0.0
    )

    return {
        "sat_water_extent_pct": round(w_extent, 2),
        "sat_vegetation_index": round(veg, 3),
        "sat_surface_change_score": round(surf_change, 2),
        "sat_landslide_change_score": round(ls_change, 2),
        "sat_flood_inundation_flag": flood_flag,
    }


def extract_geomorphology_features(terrain_row: pd.Series) -> dict[str, float]:
    """Extract and validate static geomorphometric terrain features."""
    return {
        "elevation_m": float(terrain_row.get("elevation_m", 1500.0)),
        "slope_degree": float(terrain_row.get("slope_degree", 25.0)),
        "aspect_degree": float(terrain_row.get("aspect_degree", 180.0)),
        "curvature": float(terrain_row.get("curvature", 0.0)),
        "roughness": float(terrain_row.get("roughness", 10.0)),
        "flow_accumulation": float(terrain_row.get("flow_accumulation", 500.0)),
        "drainage_density": float(terrain_row.get("drainage_density", 2.0)),
        "distance_to_river_km": float(terrain_row.get("distance_to_river_km", 2.0)),
        "distance_to_stream_km": float(terrain_row.get("distance_to_stream_km", 0.8)),
        "topographic_wetness_index": float(
            terrain_row.get("topographic_wetness_index", 9.0)
        ),
        "relative_relief": float(terrain_row.get("relative_relief", 800.0)),
    }


def extract_soil_features(soil_row: pd.Series) -> dict[str, float]:
    """Extract geotechnical and soil metrics from soil dataset."""
    moisture = (
        float(soil_row.get("soil_moisture", 25.0))
        if pd.notna(soil_row.get("soil_moisture"))
        else 25.0
    )
    clay = (
        float(soil_row.get("clay_pct", 20.0))
        if pd.notna(soil_row.get("clay_pct"))
        else 20.0
    )
    sand = (
        float(soil_row.get("sand_pct", 45.0))
        if pd.notna(soil_row.get("sand_pct"))
        else 45.0
    )
    depth = (
        float(soil_row.get("soil_depth_cm", 60.0))
        if pd.notna(soil_row.get("soil_depth_cm"))
        else 60.0
    )

    raw_stab = 1.0 - (moisture / 100.0) * 0.6 - (clay / 100.0) * 0.3
    stability = round(float(np.clip(raw_stab, 0.1, 0.95)), 3)

    return {
        "soil_moisture": moisture,
        "soil_depth_cm": depth,
        "clay_pct": clay,
        "sand_pct": sand,
        "soil_stability_index": stability,
    }


def extract_vulnerability_features(vuln_row: pd.Series) -> dict[str, float]:
    """Extract demographic and infrastructure vulnerability features."""
    pop = float(vuln_row.get("population", 200.0))
    households = float(vuln_row.get("households", pop / 5.0 if pop > 0 else 40.0))
    hosp_dist = (
        float(vuln_row.get("hospital_distance_km", 8.0))
        if pd.notna(vuln_row.get("hospital_distance_km"))
        else 8.0
    )
    health_cap = float(
        vuln_row.get(
            "healthcare_access_score", vuln_row.get("healthcare_capacity_est", 25.0)
        )
    )
    return {
        "population": pop,
        "population_log": float(np.log1p(pop)),
        "households": households,
        "temporary_house_pct": float(vuln_row.get("temporary_house_pct", 10.0)),
        "dilapidated_house_pct": float(vuln_row.get("dilapidated_house_pct", 10.0)),
        "hospital_distance_km": hosp_dist,
        "healthcare_capacity_est": health_cap,
    }
