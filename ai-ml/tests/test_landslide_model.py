"""Tests for landslide model loading, validation, and inference."""

from __future__ import annotations

from src.model_utils import get_models_dir
from src.predict import get_landslide_model, predict_hazard_single
from src.train_landslide import LANDSLIDE_FEATURES


def test_landslide_model_file_exists() -> None:
    model_path = get_models_dir() / "landslide_model.pkl"
    assert model_path.is_file()


def test_landslide_model_loads() -> None:
    clf = get_landslide_model()
    assert clf is not None
    assert hasattr(clf, "predict_proba")


def test_landslide_prediction_returns_valid_probability() -> None:
    sample = {f: 0.0 for f in LANDSLIDE_FEATURES}
    sample.update(
        {
            "rainfall_24h": 140.0,
            "rainfall_3day": 210.0,
            "slope_degree": 44.0,
            "roughness": 35.0,
            "soil_stability_index": 0.15,
            "distance_to_fault_km": 0.5,
        }
    )
    pred = predict_hazard_single(sample)
    assert 0.0 <= pred["landslide_probability"] <= 1.0
    assert pred["landslide_risk"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
