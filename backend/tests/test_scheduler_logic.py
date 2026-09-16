import pytest
from datetime import datetime, timezone

def get_next_inference_timestamp(now: datetime) -> str:
    next_run = now.replace(minute=0, second=0, microsecond=0)
    from datetime import timedelta
    if now.hour < 6:
        next_run = next_run.replace(hour=6)
    elif now.hour < 12:
        next_run = next_run.replace(hour=12)
    elif now.hour < 18:
        next_run = next_run.replace(hour=18)
    else:
        next_run = next_run.replace(hour=0) + timedelta(days=1)
    return next_run.isoformat()

def test_next_inference_boundaries():
    dt = lambda h, m: datetime(2026, 9, 15, h, m, tzinfo=timezone.utc)
    
    assert get_next_inference_timestamp(dt(0, 0)) == "2026-09-15T06:00:00+00:00"
    assert get_next_inference_timestamp(dt(0, 1)) == "2026-09-15T06:00:00+00:00"
    assert get_next_inference_timestamp(dt(5, 59)) == "2026-09-15T06:00:00+00:00"
    
    assert get_next_inference_timestamp(dt(6, 0)) == "2026-09-15T12:00:00+00:00"
    assert get_next_inference_timestamp(dt(6, 1)) == "2026-09-15T12:00:00+00:00"
    assert get_next_inference_timestamp(dt(11, 59)) == "2026-09-15T12:00:00+00:00"
    
    assert get_next_inference_timestamp(dt(12, 0)) == "2026-09-15T18:00:00+00:00"
    assert get_next_inference_timestamp(dt(12, 1)) == "2026-09-15T18:00:00+00:00"
    assert get_next_inference_timestamp(dt(17, 59)) == "2026-09-15T18:00:00+00:00"
    
    assert get_next_inference_timestamp(dt(18, 0)) == "2026-09-16T00:00:00+00:00"
    assert get_next_inference_timestamp(dt(18, 1)) == "2026-09-16T00:00:00+00:00"
    assert get_next_inference_timestamp(dt(23, 59)) == "2026-09-16T00:00:00+00:00"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
