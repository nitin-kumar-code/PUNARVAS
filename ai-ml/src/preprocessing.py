"""Input validation, data preparation, and reproducible pipeline entry point."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

try:
    from .risk_engine import score_candidate_sites, score_habitations
except ImportError:
    from risk_engine import score_candidate_sites, score_habitations


NUMERIC_COLUMNS = [
    "area_hectares", "area_km2", "households", "population", "population_density_per_km2",
    "children_0_6", "temporary_house_pct", "dilapidated_house_pct", "latitude", "longitude",
    "rainfall_2024_mm", "rainfall_mm", "elevation_m", "slope_degree", "hospital_distance_km",
    "nearest_landslide_distance_km", "historical_landslide_count", "historical_flood_count",
    "nearest_flood_distance_km", "flood_score", "landslide_score", "healthcare_capacity_est",
    "livelihood_access_est", "land_capacity", "water_capacity", "power_capacity",
    "school_capacity", "healthcare_capacity", "road_access", "livelihood_access", "hazard_score",
]

HABITATION_REQUIRED_COLUMNS = {
    "habitation_id", "village_name", "population", "population_density_per_km2",
    "children_0_6", "slope_degree", "landslide_score", "flood_score",
    "hospital_distance_km", "temporary_house_pct", "dilapidated_house_pct",
    "healthcare_capacity_est",
}

CANDIDATE_SITE_REQUIRED_COLUMNS = {
    "site_id", "site_name", "hazard_score", "land_capacity", "water_capacity",
    "power_capacity", "school_capacity", "healthcare_capacity", "road_access",
    "livelihood_access",
}


def read_csv(path: str | Path) -> pd.DataFrame:
    """Read a CSV and convert known numeric columns while preserving source fields."""
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(f"Required input file was not found: {path}")
    frame = pd.read_csv(path)
    if frame.empty:
        raise ValueError(f"Required input file contains no records: {path}")
    for column in NUMERIC_COLUMNS:
        if column in frame:
            frame[column] = pd.to_numeric(frame[column], errors="coerce")
    return frame


def validate_columns(frame: pd.DataFrame, required: set[str], dataset_name: str) -> None:
    """Fail early with an actionable message when an input schema is incomplete."""
    missing = sorted(required.difference(frame.columns))
    if missing:
        raise ValueError(
            f"{dataset_name} is missing required columns: {', '.join(missing)}"
        )


def make_hazard_data(habitations: pd.DataFrame) -> pd.DataFrame:
    """Produce the concise hazard feature table used by the risk model."""
    fields = [
        "habitation_id", "village_name", "latitude", "longitude", "rainfall_2024_mm",
        "elevation_m", "slope_degree", "nearest_landslide_distance_km",
        "historical_landslide_count", "historical_flood_count", "nearest_flood_distance_km",
        "flood_score", "landslide_score",
    ]
    available = [field for field in fields if field in habitations]
    return habitations.loc[:, available].copy()


def _records_for_json(frame: pd.DataFrame, columns: list[str]) -> list[dict]:
    records = frame.loc[:, [column for column in columns if column in frame]].copy()
    records = records.where(pd.notna(records), None)
    return json.loads(records.to_json(orient="records"))


def run_pipeline(data_dir: str | Path, output_dir: str | Path) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Run scoring end-to-end and write processed data plus JSON outputs."""
    data_dir = Path(data_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    habitations = read_csv(data_dir / "habitations.csv")
    candidate_sites = read_csv(data_dir / "candidate_sites.csv")
    validate_columns(habitations, HABITATION_REQUIRED_COLUMNS, "habitations.csv")
    validate_columns(candidate_sites, CANDIDATE_SITE_REQUIRED_COLUMNS, "candidate_sites.csv")
    make_hazard_data(habitations).to_csv(data_dir / "hazard_data.csv", index=False)

    habitation_scores = score_habitations(habitations)
    site_scores = score_candidate_sites(candidate_sites)
    habitation_scores.to_csv(data_dir / "processed_data.csv", index=False)

    habitation_columns = [
        "habitation_id", "village_name", "sub_district", "latitude", "longitude", "population",
        "hazard_component", "exposure_component", "vulnerability_component", "risk_score",
        "triage_level", "confidence_score", "explanation",
    ]
    site_columns = [
        "site_id", "site_name", "latitude", "longitude", "hazard_score", "site_safety_score",
        "site_risk_score", "site_tier", "confidence_score", "safe", "explanation",
    ]
    (output_dir / "habitation_scores.json").write_text(
        json.dumps(_records_for_json(habitation_scores, habitation_columns), indent=2), encoding="utf-8"
    )
    (output_dir / "site_scores.json").write_text(
        json.dumps(_records_for_json(site_scores, site_columns), indent=2), encoding="utf-8"
    )
    return habitation_scores, site_scores


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[1]
    run_pipeline(project_root / "data", project_root / "outputs")
    print("Pipeline complete. Outputs are in the outputs directory.")
