"""Model evaluation module producing disaster risk metrics and metadata."""

from __future__ import annotations

import datetime
import logging
from typing import Any

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from .model_utils import get_models_dir, save_feature_columns, save_metadata
from .train_flood import FLOOD_FEATURES, train_flood_model
from .train_landslide import LANDSLIDE_FEATURES, train_landslide_model

logger = logging.getLogger(__name__)


def compute_metrics_dict(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray,
) -> dict[str, Any]:
    """Calculate thorough classification performance metrics."""
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    try:
        roc_auc = roc_auc_score(y_true, y_prob) if len(np.unique(y_true)) > 1 else 0.5
    except ValueError:
        roc_auc = 0.5

    try:
        pr_auc = (
            average_precision_score(y_true, y_prob)
            if len(np.unique(y_true)) > 1
            else 0.5
        )
    except ValueError:
        pr_auc = 0.5

    cm = confusion_matrix(y_true, y_pred).tolist()

    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "confusion_matrix": cm,
    }


def run_full_model_training_and_evaluation() -> dict[str, Any]:
    """Train flood and landslide models, serialize, and record metadata."""
    print("=== Training and Evaluating Flood Model ===")
    flood_model, flood_meta = train_flood_model(save_artifacts=True)

    print("\n=== Training and Evaluating Landslide Model ===")
    landslide_model, landslide_meta = train_landslide_model(save_artifacts=True)

    combined_metadata = {
        "project": "PUNARVAS Disaster Risk Engine",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "model_version": "v1.0",
        "flood_model": flood_meta,
        "landslide_model": landslide_meta,
        "all_feature_columns": {
            "flood": FLOOD_FEATURES,
            "landslide": LANDSLIDE_FEATURES,
        },
        "evaluation_notes": (
            "Models evaluated prioritizing High-Risk Event Recall and PR-AUC. "
            "Because historical disaster instances are small (<=48 events), "
            "calibrated probability outputs represent a decision-support prototype."
        ),
    }

    # Save metadata and feature columns
    meta_path = save_metadata(combined_metadata)
    feat_path = save_feature_columns(
        FLOOD_FEATURES, get_models_dir() / "feature_columns.json"
    )
    print(f"\nMetadata recorded in {meta_path}")
    print(f"Feature columns recorded in {feat_path}")
    return combined_metadata


if __name__ == "__main__":
    run_full_model_training_and_evaluation()
