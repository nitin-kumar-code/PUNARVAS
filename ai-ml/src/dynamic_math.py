"""Mathematical core for dynamic risk aggregation."""
import pandas as pd
import numpy as np

# Configurable constants for telemetry freshness
TELEMETRY_EXPECTED_INTERVAL_HOURS = 6.0
TELEMETRY_MAX_AGE_HOURS = 48.0

def evaluate_telemetry_state(timestamp_val, reference_now=None) -> str:
    """
    Evaluate the freshness state of a telemetry timestamp.
    Returns one of: 'MISSING', 'INVALID', 'FRESH', 'STALE', 'EXPIRED'
    
    - FRESH: recent enough for active dynamic risk (<= expected interval)
    - STALE: older than expected interval, but potentially useful for display (<= max age)
    - EXPIRED: too old to be useful (> max age)
    """
    if pd.isna(timestamp_val) or not timestamp_val:
        return "MISSING"
        
    try:
        ts = pd.to_datetime(timestamp_val)
        if ts.tz is None:
            ts = ts.tz_localize("UTC")
            
        if reference_now is not None:
            now = pd.to_datetime(reference_now)
            if now.tz is None:
                now = now.tz_localize("UTC")
        else:
            now = pd.Timestamp.now('UTC')
            
        age_hours = (now - ts).total_seconds() / 3600.0
        
        if age_hours < 0:
            # Future timestamps (clock skew) treated as fresh if within a small margin, 
            # otherwise invalid. We'll just clamp it for simplicity or treat as fresh.
            if age_hours > -24.0:
                return "FRESH"
            return "INVALID"
            
        if age_hours <= TELEMETRY_EXPECTED_INTERVAL_HOURS:
            return "FRESH"
        elif age_hours <= TELEMETRY_MAX_AGE_HOURS:
            return "STALE"
        else:
            return "EXPIRED"
    except Exception:
        return "INVALID"


def compute_dynamic_hazard(
    h_static: float, 
    pf_raw: float, 
    pl_raw: float, 
    telemetry_state: str
) -> tuple[float, float]:
    """
    Compute the final hazard score securely and strictly.
    
    Assumes flood and landslide events are statistically independent (an approximation 
    used for the current prototype. Future versions may use calibrated dependency models).
    
    Args:
        h_static: The baseline static hazard score [0, 100].
        pf_raw: The flood probability [0, 1].
        pl_raw: The landslide probability [0, 1].
        telemetry_state: The string state of the telemetry ("FRESH", etc.).
        
    Returns:
        h_final: The final hazard score [0, 100].
        p_any: The computed independence-based probability union [0, 1].
    """
    # 1. Strict Math Safety: Bounds and NaNs
    def _clean_prob(p):
        if pd.isna(p) or np.isinf(p):
            return 0.0
        return float(np.clip(p, 0.0, 1.0))
        
    h_s = 0.0 if pd.isna(h_static) or np.isinf(h_static) else float(np.clip(h_static, 0.0, 100.0))
    pf = _clean_prob(pf_raw)
    pl = _clean_prob(pl_raw)
    
    # 2. Probability Union (Independence Assumption)
    p_any = 1.0 - (1.0 - pf) * (1.0 - pl)
    
    # 3. Dynamic Application (Approach A)
    # Only strictly FRESH telemetry is allowed to dynamically escalate risk.
    if telemetry_state == "FRESH":
        h_final = h_s + (100.0 - h_s) * p_any
    else:
        # EXPIRED, STALE, MISSING, INVALID -> Preserve static hazard
        h_final = h_s
        
    # Guarantee bounds
    h_final = float(np.clip(h_final, h_s, 100.0))
    
    return round(h_final, 2), round(p_any, 4)
