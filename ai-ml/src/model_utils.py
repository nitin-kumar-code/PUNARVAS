"""Model utilities for artifact serialization, metadata, and inference."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Optional

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, RobustScaler, StandardScaler

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


def get_models_dir() -> Path:
    """Return the models directory path, creating it if necessary."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    return MODELS_DIR


def create_feature_pipeline(
    numeric_features: list[str],
    categorical_features: Optional[list[str]] = None,
    scaler_type: str = "robust",
) -> ColumnTransformer:
    """Create a leak-free scikit-learn ColumnTransformer for ML modeling."""
    scaler = RobustScaler() if scaler_type == "robust" else StandardScaler()
    num_pipeline = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", scaler),
        ]
    )

    transformers = [("num", num_pipeline, numeric_features)]

    if categorical_features:
        cat_pipeline = Pipeline(
            [
                ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
                (
                    "encoder",
                    OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                ),
            ]
        )
        transformers.append(("cat", cat_pipeline, categorical_features))

    return ColumnTransformer(transformers=transformers, remainder="drop")


def save_model(model: Any, filepath: str | Path) -> Path:
    """Serialize a trained model or pipeline to disk using joblib."""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)
    logger.info("Model saved to %s", path)
    return path


def load_model(filepath: str | Path) -> Any:
    """Load a serialized model from disk with validation."""
    path = Path(filepath)
    if not path.is_file():
        raise FileNotFoundError(f"Model file not found at: {path}")
    return joblib.load(path)


def save_feature_columns(
    columns: list[str], filepath: Optional[str | Path] = None
) -> Path:
    """Store the exact ordered feature columns used during model training."""
    path = Path(filepath) if filepath else get_models_dir() / "feature_columns.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(columns, indent=2), encoding="utf-8")
    return path


def load_feature_columns(filepath: Optional[str | Path] = None) -> list[str]:
    """Load the feature column names required by the trained models."""
    path = Path(filepath) if filepath else get_models_dir() / "feature_columns.json"
    if not path.is_file():
        raise FileNotFoundError(f"Feature columns file not found at: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def save_metadata(
    metadata: dict[str, Any], filepath: Optional[str | Path] = None
) -> Path:
    """Save training metadata, validation metrics, and data distributions."""
    path = Path(filepath) if filepath else get_models_dir() / "model_metadata.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(metadata, indent=2, default=str), encoding="utf-8")
    return path


def load_metadata(filepath: Optional[str | Path] = None) -> dict[str, Any]:
    """Load stored model metadata."""
    path = Path(filepath) if filepath else get_models_dir() / "model_metadata.json"
    if not path.is_file():
        raise FileNotFoundError(f"Metadata file not found at: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def validate_input_features(
    input_df: pd.DataFrame,
    expected_features: list[str],
) -> pd.DataFrame:
    """Ensure input dataframe matches the expected feature columns and order."""
    df = input_df.copy()
    missing = [c for c in expected_features if c not in df.columns]
    if missing:
        pct = len(missing) / len(expected_features) * 100
        logger.warning(
            "FEATURE MISMATCH: Input is missing %d/%d (%.0f%%) expected features: %s. "
            "Imputing with 0. This WILL produce incorrect predictions if "
            "the missing features are important to the model.",
            len(missing), len(expected_features), pct, missing,
        )
        for c in missing:
            df[c] = 0.0
    return df[expected_features]
