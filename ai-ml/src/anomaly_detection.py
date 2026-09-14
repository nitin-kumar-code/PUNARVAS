"""Environmental Anomaly Detection using rolling Z-scores and Isolation Forests."""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)


def compute_z_scores(series: pd.Series) -> pd.Series:
    """Compute robust standard scores (Z-score) on a continuous numerical series."""
    s = pd.to_numeric(series, errors="coerce")
    mean = s.mean()
    std = s.std()
    if pd.isna(std) or std == 0:
        return pd.Series(0.0, index=series.index)
    return (s - mean) / std


def detect_rainfall_anomalies(
    weather_df: pd.DataFrame,
    z_threshold: float = 2.5,
) -> pd.DataFrame:
    """Flag rainfall records with extreme deviations from historical observations."""
    df = weather_df.copy()
    if "rainfall_mm" in df.columns:
        df["rainfall_z_score"] = compute_z_scores(df["rainfall_mm"])
        df["is_rainfall_anomaly"] = df["rainfall_z_score"] >= z_threshold
    else:
        df["is_rainfall_anomaly"] = False
    return df


def detect_river_anomalies(
    river_df: pd.DataFrame,
    surge_threshold_m_h: float = 0.5,
) -> pd.DataFrame:
    """Detect flash flood hydrometric surges and danger level exceedance."""
    df = river_df.copy()
    df["rapid_surge_detected"] = False
    df["danger_exceeded"] = False

    if "level_change_1h" in df.columns:
        df["rapid_surge_detected"] = df["level_change_1h"] >= surge_threshold_m_h

    if "water_level_m" in df.columns and "danger_level_m" in df.columns:
        df["danger_exceeded"] = df["water_level_m"] > df["danger_level_m"]

    df["is_river_anomaly"] = df["rapid_surge_detected"] | df["danger_exceeded"]
    return df


class EnvironmentalAnomalyDetector:
    """Multivariate anomaly detection using Isolation Forest."""

    def __init__(
        self,
        features: Optional[list[str]] = None,
        contamination: float = 0.05,
        random_state: int = 42,
    ) -> None:
        self.features = features or [
            "rainfall_24h",
            "rainfall_3day",
            "threshold_exceedance",
            "level_change_1h",
            "level_change_3h",
            "slope_degree",
        ]
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100,
        )
        self.is_fitted = False

    def fit(self, df: pd.DataFrame) -> "EnvironmentalAnomalyDetector":
        """Fit the isolation forest on baseline multi-sensor observations."""
        avail_features = [f for f in self.features if f in df.columns]
        if not avail_features:
            raise ValueError(
                f"None of the anomaly features {self.features} found in input data."
            )
        X = df[avail_features].fillna(df[avail_features].median()).values
        self.model.fit(X)
        self.is_fitted = True
        return self

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """Return boolean anomaly flags (-1 -> True, 1 -> False) and anomaly scores."""
        if not self.is_fitted:
            self.fit(df)
        avail_features = [f for f in self.features if f in df.columns]
        X = df[avail_features].fillna(df[avail_features].median()).values
        raw_preds = self.model.predict(X)
        scores = self.model.decision_function(X)

        res = df.copy()
        res["anomaly_flag"] = raw_preds == -1
        # Invert score so higher value means more anomalous (0 to 1 range approx)
        res["anomaly_score"] = np.round(1.0 / (1.0 + np.exp(scores)), 3)
        return res
