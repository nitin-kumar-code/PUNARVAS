"""Population-exposure scoring."""

from __future__ import annotations

import numpy as np
import pandas as pd


def min_max(series: pd.Series, *, log_scale: bool = False) -> pd.Series:
    """Scale a numeric series to 0–100 after median imputation."""
    values = pd.to_numeric(series, errors="coerce")
    values = values.fillna(values.median() if values.notna().any() else 0.0).clip(lower=0)
    if log_scale:
        values = np.log1p(values)
    low, high = values.min(), values.max()
    if high == low:
        return pd.Series(0.0, index=series.index)
    return 100 * (values - low) / (high - low)


def calculate_exposure_score(frame: pd.DataFrame) -> pd.Series:
    """Return a 0–100 score for people and sensitive groups exposed to harm."""
    population = min_max(frame.get("population", pd.Series(0, index=frame.index)), log_scale=True)
    density = min_max(
        frame.get("population_density_per_km2", pd.Series(0, index=frame.index)),
        log_scale=True,
    )
    children = min_max(frame.get("children_0_6", pd.Series(0, index=frame.index)), log_scale=True)
    return (0.60 * population + 0.25 * density + 0.15 * children).round(2)
