import pytest
from datetime import datetime, timezone, timedelta
from app.services.ml_prediction_service import ml_prediction_service

# Hack for ai-ml imports during tests if not in path
import sys
import os
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "ai-ml"))

from src.dynamic_math import evaluate_telemetry_state, compute_dynamic_hazard

def test_telemetry_freshness():
    import pandas as pd
    
    fixed_now = pd.Timestamp('2026-09-15 12:00:00', tz='UTC')
    fixed_now_str = fixed_now.isoformat()
    
    # Exactly 6h
    ts_6h = (fixed_now - timedelta(hours=6)).isoformat()
    assert evaluate_telemetry_state(ts_6h, reference_now=fixed_now_str) == "FRESH"
    
    # 6h + 1 sec (exactly one second past the expected interval)
    ts_6h_1s = (fixed_now - timedelta(hours=6, seconds=1)).isoformat()
    assert evaluate_telemetry_state(ts_6h_1s, reference_now=fixed_now_str) == "STALE"
    
    # Exactly 48h
    ts_48h = (fixed_now - timedelta(hours=48)).isoformat()
    assert evaluate_telemetry_state(ts_48h, reference_now=fixed_now_str) == "STALE"
    
    # 48h + 1 sec
    ts_48h_1s = (fixed_now - timedelta(hours=48, seconds=1)).isoformat()
    assert evaluate_telemetry_state(ts_48h_1s, reference_now=fixed_now_str) == "EXPIRED"
    
    # 7 days
    ts_7d = (fixed_now - timedelta(days=7)).isoformat()
    assert evaluate_telemetry_state(ts_7d, reference_now=fixed_now_str) == "EXPIRED"
    
    # Future (within 24h)
    ts_future = (fixed_now + timedelta(hours=2)).isoformat()
    assert evaluate_telemetry_state(ts_future, reference_now=fixed_now_str) == "FRESH"
    
    # Future (invalid)
    ts_future_far = (fixed_now + timedelta(hours=48)).isoformat()
    assert evaluate_telemetry_state(ts_future_far, reference_now=fixed_now_str) == "INVALID"
    
    # Missing / Malformed
    assert evaluate_telemetry_state(None, reference_now=fixed_now_str) == "MISSING"
    assert evaluate_telemetry_state("", reference_now=fixed_now_str) == "MISSING"
    assert evaluate_telemetry_state("invalid-date", reference_now=fixed_now_str) == "INVALID"
    
    # Naive vs Aware
    ts_naive = datetime.now().isoformat()  # usually naive
    state_naive = evaluate_telemetry_state(ts_naive, reference_now=fixed_now_str)
    # The naive test compares against 2026 fixed_now, meaning it will likely be far in the future or past
    assert state_naive in ["FRESH", "STALE", "EXPIRED", "INVALID"]

def test_math_safety():
    # Pany
    # 1 - (1-0.5)*(1-0.5) = 1 - 0.25 = 0.75
    h_fin, p_any = compute_dynamic_hazard(50, 0.5, 0.5, "FRESH")
    assert round(p_any, 2) == 0.75
    
    # Approach A: 50 + (50 * 0.75) = 87.5
    assert h_fin == 87.5
    
    # Monotonicity / bounds
    h_fin2, p_any2 = compute_dynamic_hazard(90, 0.9, 0.9, "FRESH")
    assert h_fin2 == 99.9  # 90 + 10 * 0.99
    
    # Invalid probs -> 0
    h_fin3, p_any3 = compute_dynamic_hazard(60, float('nan'), float('inf'), "FRESH")
    assert p_any3 == 0.0
    assert h_fin3 == 60.0
    
    # Stale/Expired -> defaults to static
    h_fin4, p_any4 = compute_dynamic_hazard(60, 0.9, 0.9, "STALE")
    assert h_fin4 == 60.0
    
    h_fin5, p_any5 = compute_dynamic_hazard(60, 0.9, 0.9, "EXPIRED")
    assert h_fin5 == 60.0

def test_hardcoded_timestamp_prevention():
    ml_prediction_service.initialize()
    if not ml_prediction_service._batch_cache:
        ml_prediction_service.get_all_predictions()
    
    records = ml_prediction_service._batch_cache
    if records:
        ts1 = records[0]["updated_at"]
        assert ts1 != "2024-10-24T12:00:00Z", "Found hardcoded timestamp!"
        # check parsing
        datetime.fromisoformat(ts1)

if __name__ == "__main__":
    pytest.main(["-v", __file__])

def test_telemetry_freshness_reference_time_jitter():
    import time
    from datetime import datetime, timezone, timedelta
    
    # 1. Capture exact reference time
    reference_now = datetime.now(timezone.utc)
    reference_str = reference_now.isoformat()
    
    # 2. Construct exactly 6h old timestamp based on reference
    ts_exactly_6h = (reference_now - timedelta(hours=6)).isoformat()
    
    # 3. Sleep slightly to simulate real clock jitter / pipeline processing time
    time.sleep(0.01)
    
    # 4. Evaluate WITHOUT reference_now (simulating old buggy behavior)
    # Since pd.Timestamp.now() is called inside, it will be > 6h
    # Note: On very fast systems this might still be FRESH if < microsecond, but sleep guarantees it.
    buggy_state = evaluate_telemetry_state(ts_exactly_6h)
    
    # 5. Evaluate WITH reference_now (simulating new fixed behavior)
    fixed_state = evaluate_telemetry_state(ts_exactly_6h, reference_now=reference_str)
    
    # The old behavior would incorrectly flag it STALE due to the jitter!
    # The new behavior correctly flags it FRESH because reference_time is fixed.
    assert buggy_state == "STALE"
    assert fixed_state == "FRESH"
