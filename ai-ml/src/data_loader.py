"""Safe data loading, schema validation, and type normalization layer."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import pandas as pd

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def get_data_dir() -> Path:
    """Return the resolved path to the data directory."""
    return DATA_DIR


def safe_load_csv(
    file_path: str | Path,
    required_columns: Optional[list[str]] = None,
    date_columns: Optional[list[str]] = None,
    numeric_columns: Optional[list[str]] = None,
    drop_duplicates: bool = True,
    subset_for_duplicates: Optional[list[str]] = None,
) -> pd.DataFrame:
    """Load a CSV file with validation, date parsing, and conversion."""
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Dataset not found at expected path: {path}")

    try:
        df = pd.read_csv(path, low_memory=False)
    except Exception as e:
        raise ValueError(f"Failed to parse CSV file at {path}: {e}") from e

    if df.empty:
        raise ValueError(f"Dataset is empty: {path}")

    # Validate required columns
    if required_columns:
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            raise ValueError(f"File {path.name} is missing required columns: {missing}")

    # Date parsing
    if date_columns:
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors="coerce")

    # Numeric conversion
    if numeric_columns:
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

    # Duplicate handling
    if drop_duplicates:
        initial_len = len(df)
        df = df.drop_duplicates(subset=subset_for_duplicates).reset_index(drop=True)
        dropped = initial_len - len(df)
        if dropped > 0:
            logger.info("Dropped %d duplicate rows from %s", dropped, path.name)

    return df


def load_habitations(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load baseline habitations dataset."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["habitation_id", "village_name", "latitude", "longitude", "population"]
    numeric = [
        "population",
        "households",
        "elevation_m",
        "slope_degree",
        "latitude",
        "longitude",
    ]
    return safe_load_csv(
        dir_path / "habitations.csv",
        required_columns=required,
        numeric_columns=numeric,
        subset_for_duplicates=["habitation_id"],
    )


def load_candidate_sites(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load candidate relocation sites dataset."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["site_id", "site_name", "latitude", "longitude"]
    numeric = [
        "land_capacity",
        "water_capacity",
        "power_capacity",
        "school_capacity",
        "healthcare_capacity",
        "road_access",
        "livelihood_access",
        "hazard_score",
    ]
    return safe_load_csv(
        dir_path / "candidate_sites.csv",
        required_columns=required,
        numeric_columns=numeric,
        subset_for_duplicates=["site_id"],
    )


def load_hazard_data(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load hazard metrics dataset."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["habitation_id", "latitude", "longitude"]
    return safe_load_csv(
        dir_path / "hazard_data.csv",
        required_columns=required,
        subset_for_duplicates=["habitation_id"],
    )


def load_disaster_events(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load historical disaster event records."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = [
        "event_id",
        "event_type",
        "event_date",
        "latitude",
        "longitude",
        "severity",
    ]
    dates = ["event_date"]
    numeric = [
        "latitude",
        "longitude",
        "affected_population",
        "houses_damaged",
        "road_damaged",
    ]
    df = safe_load_csv(
        dir_path / "disaster_events.csv",
        required_columns=required,
        date_columns=dates,
        numeric_columns=numeric,
        subset_for_duplicates=["event_id"],
    )
    df["event_type"] = df["event_type"].astype(str).str.lower().str.strip()
    df["severity"] = df["severity"].astype(str).str.lower().str.strip()
    return df


def load_weather_history(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load meteorological observations."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["timestamp", "latitude", "longitude", "rainfall_mm"]
    dates = ["timestamp"]
    numeric = [
        "latitude",
        "longitude",
        "rainfall_mm",
        "temperature_c",
        "humidity_pct",
        "wind_speed_ms",
        "pressure_hpa",
    ]
    return safe_load_csv(
        dir_path / "weather_history.csv",
        required_columns=required,
        date_columns=dates,
        numeric_columns=numeric,
    )


def load_river_levels(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load hydrometric river gauge observations."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["timestamp", "station_id", "water_level_m", "danger_level_m"]
    dates = ["timestamp"]
    numeric = [
        "water_level_m",
        "danger_level_m",
        "warning_level_m",
        "flow_cumecs",
        "level_change_1h",
        "level_change_3h",
        "level_change_6h",
    ]
    return safe_load_csv(
        dir_path / "river_levels.csv",
        required_columns=required,
        date_columns=dates,
        numeric_columns=numeric,
    )


def load_terrain_features(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load geomorphometric terrain features."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["habitation_id", "elevation_m", "slope_degree", "distance_to_river_km"]
    numeric = [
        "elevation_m",
        "slope_degree",
        "aspect_degree",
        "curvature",
        "roughness",
        "flow_accumulation",
        "drainage_density",
        "distance_to_river_km",
        "distance_to_stream_km",
        "topographic_wetness_index",
        "relative_relief",
    ]
    return safe_load_csv(
        dir_path / "terrain_features.csv",
        required_columns=required,
        numeric_columns=numeric,
        subset_for_duplicates=["habitation_id"],
    )


def load_soil_data(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load geotechnical and soil characteristics."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["habitation_id", "soil_type"]
    numeric = [
        "soil_depth_cm",
        "soil_moisture",
        "clay_pct",
        "sand_pct",
        "silt_pct",
        "organic_carbon_pct",
    ]
    return safe_load_csv(
        dir_path / "soil_data.csv",
        required_columns=required,
        numeric_columns=numeric,
        subset_for_duplicates=["habitation_id"],
    )


def load_satellite_data(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load remote sensing satellite observations."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["habitation_id", "timestamp", "water_extent_pct"]
    dates = ["timestamp"]
    numeric = [
        "latitude",
        "longitude",
        "water_extent_pct",
        "vegetation_index",
        "surface_change_score",
        "landslide_change_score",
        "flood_inundation_flag",
        "cloud_cover_pct",
    ]
    return safe_load_csv(
        dir_path / "satellite_observations.csv",
        required_columns=required,
        date_columns=dates,
        numeric_columns=numeric,
    )


def load_vulnerability_data(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load demographic and infrastructure vulnerability metrics."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["habitation_id", "population"]
    numeric = [
        "population",
        "households",
        "population_density",
        "children_0_6_pct",
        "elderly_pct",
        "disability_pct",
        "temporary_house_pct",
        "dilapidated_house_pct",
        "literacy_rate",
        "income_index",
        "road_access_score",
        "healthcare_access_score",
        "communication_score",
    ]
    return safe_load_csv(
        dir_path / "vulnerability_data.csv",
        required_columns=required,
        numeric_columns=numeric,
        subset_for_duplicates=["habitation_id"],
    )


def load_site_capacity(data_dir: Optional[str | Path] = None) -> pd.DataFrame:
    """Load candidate site capacities and accessibilities."""
    dir_path = Path(data_dir) if data_dir else get_data_dir()
    required = ["site_id"]
    numeric = [
        "land_capacity_people",
        "water_capacity_people",
        "sanitation_capacity_people",
        "healthcare_capacity_people",
        "power_capacity_people",
        "school_capacity_people",
        "existing_population",
        "usable_capacity",
        "remaining_capacity",
    ]
    return safe_load_csv(
        dir_path / "site_capacity.csv",
        required_columns=required,
        numeric_columns=numeric,
        subset_for_duplicates=["site_id"],
    )
