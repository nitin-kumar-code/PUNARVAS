"""Label engineering for disaster events and ground truth risk."""

from __future__ import annotations

import logging

import numpy as np
import pandas as pd

from .feature_engineering import haversine_distance_km

logger = logging.getLogger(__name__)

SEVERITY_MAP = {
    "low": 0,
    "moderate": 1,
    "high": 2,
    "severe": 2,
    "critical": 3,
}


def map_severity_to_class(severity_str: str) -> int:
    """Map text severity strings to ordinal risk class (0 to 3)."""
    return SEVERITY_MAP.get(str(severity_str).lower().strip(), 0)


def create_binary_disaster_labels(
    events_df: pd.DataFrame,
    target_event_type: str = "flood",
) -> pd.Series:
    """Generate binary indicator series for a given disaster event type."""
    type_series = events_df["event_type"].str.lower()
    if target_event_type == "flood":
        return type_series.str.contains("flood", na=False).astype(int)
    if target_event_type == "landslide":
        return (
            type_series.str.contains("landslide", na=False)
            | type_series.str.contains("cloudburst", na=False)
        ).astype(int)
    return (type_series == target_event_type.lower()).astype(int)


def associate_events_to_habitations(
    habitations_df: pd.DataFrame,
    events_df: pd.DataFrame,
    max_distance_km: float = 3.5,
) -> pd.DataFrame:
    """Associate disaster events with habitations based on ID or proximity."""
    associations = []
    hab_coords = habitations_df[["habitation_id", "latitude", "longitude"]].copy()

    for _, event in events_df.iterrows():
        # Check direct habitation_id match
        event_hab_id = event.get("habitation_id")
        matched = False
        if pd.notna(event_hab_id) and str(event_hab_id).lower() != "na":
            try:
                target_id = int(float(event_hab_id))
                matched_rows = hab_coords[hab_coords["habitation_id"] == target_id]
                if not matched_rows.empty:
                    associations.append(
                        {
                            "habitation_id": target_id,
                            "event_id": event["event_id"],
                            "event_date": pd.to_datetime(event["event_date"]),
                            "event_type": str(event["event_type"]).lower().strip(),
                            "severity": str(event["severity"]).lower().strip(),
                            "severity_class": map_severity_to_class(event["severity"]),
                            "distance_km": 0.0,
                            "verified": int(event.get("verified", 1)),
                        }
                    )
                    matched = True
            except (ValueError, TypeError):
                matched = False

        has_coords = pd.notna(event.get("latitude")) and pd.notna(
            event.get("longitude")
        )
        if not matched and has_coords:
            e_lat = float(event["latitude"])
            e_lon = float(event["longitude"])
            dists = np.asarray(
                haversine_distance_km(
                    e_lat,
                    e_lon,
                    hab_coords["latitude"].values,
                    hab_coords["longitude"].values,
                )
            )
            nearby_mask = dists <= max_distance_km
            if np.any(nearby_mask):
                nearby_habs = hab_coords[nearby_mask].copy()
                nearby_habs["dist"] = dists[nearby_mask]
                for _, nh in nearby_habs.iterrows():
                    associations.append(
                        {
                            "habitation_id": int(nh["habitation_id"]),
                            "event_id": event["event_id"],
                            "event_date": pd.to_datetime(event["event_date"]),
                            "event_type": str(event["event_type"]).lower().strip(),
                            "severity": str(event["severity"]).lower().strip(),
                            "severity_class": map_severity_to_class(event["severity"]),
                            "distance_km": round(float(nh["dist"]), 2),
                            "verified": int(event.get("verified", 1)),
                        }
                    )

    result = pd.DataFrame(associations)
    if not result.empty:
        result = result.drop_duplicates(
            subset=["habitation_id", "event_date", "event_type"]
        ).reset_index(drop=True)
    return result
