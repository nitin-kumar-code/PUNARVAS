"""Tests for flood risk model loading, feature validation, and inference."""

from __future__ import annotations

from src.model_utils import get_models_dir
from src.predict import get_flood_model, predict_hazard_single
from src.train_flood import FLOOD_FEATURES


def test_flood_model_file_exists() -> None:
    model_path = get_models_dir() / "flood_model.pkl"
    assert model_path.is_file()


def test_flood_model_loads() -> None:
    clf = get_flood_model()
    assert clf is not None
    assert hasattr(clf, "predict_proba")


def test_flood_prediction_returns_valid_probability() -> None:
    sample = {f: 0.0 for f in FLOOD_FEATURES}
    sample.update(
        {
            "rainfall_24h": 180.0,
            "rainfall_3day": 240.0,
            "river_level": 1008.0,
            "threshold_exceedance": 3.0,
            "distance_to_river_km": 0.05,
            "slope_degree": 15.0,
        }
    )
    pred = predict_hazard_single(sample)
    assert 0.0 <= pred["flood_probability"] <= 1.0
    assert pred["flood_risk"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
