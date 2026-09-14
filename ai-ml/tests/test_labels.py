"""Tests for label engineering and disaster event association."""

from __future__ import annotations

import pandas as pd

from src.label_engineering import (
    associate_events_to_habitations,
    create_binary_disaster_labels,
    map_severity_to_class,
)


def test_map_severity_to_class() -> None:
    assert map_severity_to_class("low") == 0
    assert map_severity_to_class("moderate") == 1
    assert map_severity_to_class("high") == 2
    assert map_severity_to_class("severe") == 2
    assert map_severity_to_class("critical") == 3
    assert map_severity_to_class("unknown") == 0


def test_create_binary_disaster_labels() -> None:
    df = pd.DataFrame(
        {
            "event_type": [
                "flash_flood",
                "flood",
                "landslide",
                "cloudburst",
                "earthquake",
            ]
        }
    )
    flood_labels = create_binary_disaster_labels(df, "flood")
    assert flood_labels.tolist() == [1, 1, 0, 0, 0]

    landslide_labels = create_binary_disaster_labels(df, "landslide")
    assert landslide_labels.tolist() == [0, 0, 1, 1, 0]


def test_associate_events_to_habitations() -> None:
    habitations = pd.DataFrame(
        {
            "habitation_id": [101, 102],
            "latitude": [30.40, 30.50],
            "longitude": [79.40, 79.50],
        }
    )
    events = pd.DataFrame(
        {
            "event_id": ["EVT-1", "EVT-2"],
            "habitation_id": ["101", "NA"],
            "event_date": ["2021-10-18", "2021-10-18"],
            "event_type": ["flash_flood", "landslide"],
            "latitude": [30.401, 30.501],
            "longitude": [79.401, 79.501],
            "severity": ["severe", "moderate"],
            "verified": [1, 1],
        }
    )
    associations = associate_events_to_habitations(
        habitations, events, max_distance_km=2.0
    )
    assert len(associations) == 2
    assert set(associations["habitation_id"]) == {101, 102}
