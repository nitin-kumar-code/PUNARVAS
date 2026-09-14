"""Build leak-free training dataset merging spatial and temporal data."""

from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import pandas as pd

from .data_loader import (
    load_disaster_events,
    load_habitations,
    load_river_levels,
    load_satellite_data,
    load_soil_data,
    load_terrain_features,
    load_vulnerability_data,
    load_weather_history,
)
from .feature_engineering import (
    compute_river_features_for_date,
    compute_satellite_features_for_date,
    compute_weather_features_for_date,
    extract_geomorphology_features,
    extract_soil_features,
    extract_vulnerability_features,
)
from .label_engineering import associate_events_to_habitations

logger = logging.getLogger(__name__)


def build_training_dataset(data_dir: str | Path | None = None) -> pd.DataFrame:
    """Build unified dataset with strict predictor/target separation."""
    print("Loading raw datasets for training data construction...")
    habitations = load_habitations(data_dir)
    events = load_disaster_events(data_dir)
    weather = load_weather_history(data_dir)
    river = load_river_levels(data_dir)
    satellite = load_satellite_data(data_dir)
    terrain = load_terrain_features(data_dir)
    soil = load_soil_data(data_dir)
    vuln = load_vulnerability_data(data_dir)

    print("Associating historical events with habitations...")
    associations = associate_events_to_habitations(
        habitations, events, max_distance_km=3.5
    )
    print(f"Total positive event-habitation associations: {len(associations)}")

    # Index static tables by habitation_id
    terrain_map = terrain.set_index("habitation_id")
    soil_map = soil.set_index("habitation_id")
    vuln_map = vuln.set_index("habitation_id")
    hab_map = habitations.set_index("habitation_id")

    rows = []

    # 1. Process Positive Historical Episodes
    for _, assoc in associations.iterrows():
        hid = assoc["habitation_id"]
        date = assoc["event_date"]
        lat = (
            float(hab_map.loc[hid, "latitude"])
            if hid in hab_map.index
            else float(assoc["latitude"])
        )
        lon = (
            float(hab_map.loc[hid, "longitude"])
            if hid in hab_map.index
            else float(assoc["longitude"])
        )

        w_feats = compute_weather_features_for_date(lat, lon, date, weather)
        r_feats = compute_river_features_for_date(lat, lon, date, river)
        sat_feats = compute_satellite_features_for_date(hid, date, satellite)
        t_row = terrain_map.loc[hid] if hid in terrain_map.index else pd.Series()
        t_feats = extract_geomorphology_features(t_row)
        v_row = vuln_map.loc[hid] if hid in vuln_map.index else pd.Series()
        v_feats = extract_vulnerability_features(v_row)
        s_row = soil_map.loc[hid] if hid in soil_map.index else pd.Series()
        s_feats = extract_soil_features(s_row)

        is_flood = int("flood" in assoc["event_type"])
        is_landslide = int(
            "landslide" in assoc["event_type"] or "cloudburst" in assoc["event_type"]
        )

        row = {
            "habitation_id": hid,
            "latitude": lat,
            "longitude": lon,
            "date": date.strftime("%Y-%m-%d"),
            **w_feats,
            **r_feats,
            **sat_feats,
            **t_feats,
            **s_feats,
            "distance_to_fault_km": float(hab_map.loc[hid, "distance_to_fault_km"])
            if hid in hab_map.index
            and "distance_to_fault_km" in hab_map.columns
            and pd.notna(hab_map.loc[hid, "distance_to_fault_km"])
            else 5.0,
            **v_feats,
            "flood_label": is_flood,
            "landslide_label": is_landslide,
            "severity_class": int(assoc["severity_class"]),
        }
        rows.append(row)

    # 2. Curate Baseline Non-Disaster Negative Samples
    calm_dates = [
        pd.Timestamp("2021-02-04"),
        pd.Timestamp("2021-02-06"),
        pd.Timestamp("2021-10-16"),
        pd.Timestamp("2021-10-20"),
        pd.Timestamp("2022-07-16"),
        pd.Timestamp("2023-07-12"),
        pd.Timestamp("2024-09-14"),
    ]
    disaster_dates = sorted(associations["event_date"].unique())
    all_sample_dates = calm_dates + list(disaster_dates)

    positive_hids_per_date = {
        d: set(associations[associations["event_date"] == d]["habitation_id"])
        for d in disaster_dates
    }

    np.random.seed(42)
    sample_habs = habitations.sample(n=min(300, len(habitations)), random_state=42)

    for date in all_sample_dates:
        pos_hids = positive_hids_per_date.get(date, set())
        candidates = sample_habs[~sample_habs["habitation_id"].isin(pos_hids)]
        picked = candidates.sample(
            n=min(20, len(candidates)), random_state=int(date.timestamp()) % 100000
        )

        for _, hab_row in picked.iterrows():
            hid = hab_row["habitation_id"]
            lat = float(hab_row["latitude"])
            lon = float(hab_row["longitude"])

            w_feats = compute_weather_features_for_date(lat, lon, date, weather)
            r_feats = compute_river_features_for_date(lat, lon, date, river)
            sat_feats = compute_satellite_features_for_date(hid, date, satellite)
            t_row = terrain_map.loc[hid] if hid in terrain_map.index else pd.Series()
            t_feats = extract_geomorphology_features(t_row)
            v_row = vuln_map.loc[hid] if hid in vuln_map.index else pd.Series()
            v_feats = extract_vulnerability_features(v_row)
            s_row = soil_map.loc[hid] if hid in soil_map.index else pd.Series()
            s_feats = extract_soil_features(s_row)

            row = {
                "habitation_id": hid,
                "latitude": lat,
                "longitude": lon,
                "date": date.strftime("%Y-%m-%d"),
                **w_feats,
                **r_feats,
                **sat_feats,
                **t_feats,
                **s_feats,
                "distance_to_fault_km": float(hab_row.get("distance_to_fault_km", 5.0))
                if pd.notna(hab_row.get("distance_to_fault_km"))
                else 5.0,
                **v_feats,
                "flood_label": 0,
                "landslide_label": 0,
                "severity_class": 0,
            }
            rows.append(row)

    df_train = pd.DataFrame(rows)
    df_train = df_train.drop_duplicates(subset=["habitation_id", "date"]).reset_index(
        drop=True
    )

    out_path = (
        Path(data_dir) if data_dir else Path("data")
    ) / "training_data.csv"
    df_train.to_csv(out_path, index=False)
    print(f"Generated {out_path} with shape {df_train.shape}.")
    f_counts = df_train["flood_label"].value_counts().to_dict()
    l_counts = df_train["landslide_label"].value_counts().to_dict()
    print(f"Class breakdown - Flood: {f_counts}, Landslide: {l_counts}")
    return df_train


if __name__ == "__main__":
    build_training_dataset()
