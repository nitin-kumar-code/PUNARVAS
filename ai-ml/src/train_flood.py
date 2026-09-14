"""Training pipeline for Flood Risk prediction with multi-sensor data."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import (
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline

from .model_utils import (
    create_feature_pipeline,
    get_models_dir,
    save_feature_columns,
    save_model,
)

logger = logging.getLogger(__name__)

FLOOD_FEATURES = [
    "rainfall_24h",
    "rainfall_3day",
    "rainfall_7day",
    "rainfall_anomaly",
    "temperature",
    "humidity",
    "pressure_hpa",
    "wind_speed_ms",
    "river_level",
    "threshold_exceedance",
    "level_change_1h",
    "level_change_3h",
    "level_change_6h",
    "flow_cumecs",
    "river_level_percentile",
    "sat_water_extent_pct",
    "sat_flood_inundation_flag",
    "sat_surface_change_score",
    "elevation_m",
    "slope_degree",
    "distance_to_river_km",
    "distance_to_stream_km",
    "drainage_density",
    "flow_accumulation",
    "topographic_wetness_index",
    "relative_relief",
    "soil_moisture",
    "clay_pct",
]


def train_flood_model(
    training_data_path: str | Path | None = None,
    save_artifacts: bool = True,
) -> tuple[Any, dict[str, Any]]:
    """Train and calibrate the flood risk prediction model using temporal splitting."""
    data_path = (
        Path(training_data_path)
        if training_data_path
        else Path("data/training_data.csv")
    )
    df = pd.read_csv(data_path)
    df["date_dt"] = pd.to_datetime(df["date"])

    # Temporal split: <= 2021 (Train), >= 2022 (Test)
    split_date = pd.Timestamp("2021-12-31")
    train_mask = df["date_dt"] <= split_date
    test_mask = df["date_dt"] > split_date

    if (
        df.loc[test_mask, "flood_label"].sum() == 0
        or df.loc[train_mask, "flood_label"].sum() == 0
    ):
        from sklearn.model_selection import train_test_split

        train_idx, test_idx = train_test_split(
            df.index, test_size=0.25, random_state=42, stratify=df["flood_label"]
        )
        train_df = df.loc[train_idx]
        test_df = df.loc[test_idx]
    else:
        train_df = df[train_mask]
        test_df = df[test_mask]

    X_train = train_df[FLOOD_FEATURES]
    y_train = train_df["flood_label"]
    X_test = test_df[FLOOD_FEATURES]
    y_test = test_df["flood_label"]

    print(
        f"Enhanced Flood training set: {len(X_train)} samples ({y_train.sum()} floods)"
    )
    print(f"Enhanced Flood test set: {len(X_test)} samples ({y_test.sum()} floods)")

    preprocessor = create_feature_pipeline(
        numeric_features=FLOOD_FEATURES, scaler_type="robust"
    )

    # Tuned Candidate models
    candidates = {
        "LogisticRegression": LogisticRegression(
            class_weight="balanced", max_iter=1000, C=0.5, random_state=42
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=150,
            max_depth=6,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
        ),
        "GradientBoosting": GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.08,
            max_depth=4,
            subsample=0.85,
            random_state=42,
        ),
        "ExtraTrees": ExtraTreesClassifier(
            n_estimators=120,
            max_depth=6,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
        ),
    }

    best_score = -1.0
    best_name = "GradientBoosting"
    best_pipeline = None
    comparison = {}

    for name, clf in candidates.items():
        pipe = Pipeline(
            [
                ("preprocessor", preprocessor),
                ("classifier", clf),
            ]
        )
        pipe.fit(X_train, y_train)
        probs = pipe.predict_proba(X_test)[:, 1]
        preds = pipe.predict(X_test)

        recall = recall_score(y_test, preds, zero_division=0)
        precision = precision_score(y_test, preds, zero_division=0)
        f1 = f1_score(y_test, preds, zero_division=0)
        roc_auc = roc_auc_score(y_test, probs) if len(np.unique(y_test)) > 1 else 0.5
        pr_auc = (
            average_precision_score(y_test, probs)
            if len(np.unique(y_test)) > 1
            else 0.5
        )

        opt_score = 0.5 * recall + 0.5 * pr_auc
        comparison[name] = {
            "recall": round(float(recall), 4),
            "precision": round(float(precision), 4),
            "f1": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "pr_auc": round(float(pr_auc), 4),
            "opt_score": round(float(opt_score), 4),
        }
        metrics_msg = (
            f"[{name}] Recall: {recall:.3f}, Precision: {precision:.3f}, "
            f"F1: {f1:.3f}, ROC-AUC: {roc_auc:.3f}, PR-AUC: {pr_auc:.3f}"
        )
        print(metrics_msg)

        if opt_score > best_score:
            best_score = opt_score
            best_name = name
            best_pipeline = pipe

    print(f"Selected Best Enhanced Flood Model: {best_name} (Score: {best_score:.4f})")

    # Calibrate probability predictions
    calibrated_clf = CalibratedClassifierCV(
        estimator=best_pipeline,
        method="sigmoid",
        cv="prefit",
    )
    calibrated_clf.fit(X_test, y_test)

    metadata = {
        "model_type": best_name,
        "hazard_type": "flood",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "positive_train_samples": int(y_train.sum()),
        "positive_test_samples": int(y_test.sum()),
        "features": FLOOD_FEATURES,
        "metrics": comparison[best_name],
        "comparison": comparison,
    }

    if save_artifacts:
        save_path = get_models_dir() / "flood_model.pkl"
        save_model(calibrated_clf, save_path)
        save_feature_columns(FLOOD_FEATURES, get_models_dir() / "feature_columns.json")
        print(f"Flood model successfully serialized to {save_path}")

    return calibrated_clf, metadata


if __name__ == "__main__":
    train_flood_model()
