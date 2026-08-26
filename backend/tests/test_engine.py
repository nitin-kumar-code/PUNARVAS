import pytest
from uuid import uuid4
import math
from app.optimization.engine import BaselineRelocationEngine, ScoringConfig, haversine_distance
from app.optimization.schemas import (
    OptimizerHabitation,
    OptimizerCandidateSite,
    OptimizerInput,
    OptimizerStatus,
    OptimizerSiteStatus
)

def create_mock_habitation(population=1000, lat=20.0, lon=80.0):
    return OptimizerHabitation(
        habitation_id=uuid4(),
        population=population,
        vulnerable_population=min(300, population),
        latitude=lat,
        longitude=lon,
        risk_score=90.0,
        risk_level="HIGH",
        primary_hazard="FLOOD"
    )

def create_mock_site(name, capacity, lat=20.1, lon=80.1, status=OptimizerSiteStatus.ACTIVE, hazard_exposure=10.0, safety=90.0):
    return OptimizerCandidateSite(
        site_id=uuid4(),
        name=name,
        latitude=lat,
        longitude=lon,
        total_capacity=max(capacity, 100),
        available_capacity=capacity,
        safety_score=safety,
        accessibility_score=85.0,
        infrastructure_score=80.0,
        healthcare_score=75.0,
        community_score=70.0,
        hazard_exposure=hazard_exposure,
        status=status
    )

@pytest.fixture
def engine():
    return BaselineRelocationEngine()

def test_distance_calculation():
    dist = haversine_distance(20.0, 80.0, 20.1, 80.1)
    assert math.isclose(dist, 15.3, abs_tol=0.2)

def test_fully_covered(engine):
    hab = create_mock_habitation(population=500)
    site = create_mock_site("Site A", capacity=1000)
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site])
    
    out = engine.optimize(inp)
    assert out.status == OptimizerStatus.FULLY_COVERED
    assert out.allocated_population == 500
    assert out.uncovered_population == 0
    assert out.coverage_percentage == 100.0
    assert len(out.allocations) == 1
    assert out.allocations[0].population == 500

def test_insufficient_capacity(engine):
    hab = create_mock_habitation(population=1840)
    site = create_mock_site("Site A", capacity=1100)
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site])
    
    out = engine.optimize(inp)
    assert out.status == OptimizerStatus.INSUFFICIENT_CAPACITY
    assert out.allocated_population == 1100
    assert out.uncovered_population == 740
    assert out.coverage_percentage == round((1100/1840)*100, 2)
    assert len(out.allocations) == 1
    assert out.allocations[0].population == 1100

def test_unsafe_site(engine):
    hab = create_mock_habitation(population=1000)
    site = create_mock_site("Unsafe Site", capacity=2000, status=OptimizerSiteStatus.UNSAFE)
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site])
    
    out = engine.optimize(inp)
    assert out.status == OptimizerStatus.NO_SAFE_SITE
    assert out.allocated_population == 0
    assert out.uncovered_population == 1000
    assert len(out.allocations) == 0
    assert len(out.rejected_sites) == 1
    assert "UNSAFE" in out.rejected_sites[0].reason

def test_multiple_sites_and_deterministic_ranking(engine):
    hab = create_mock_habitation(population=1500)
    site_a = create_mock_site("Site A", capacity=1000, safety=50.0)
    site_b = create_mock_site("Site B", capacity=1000, safety=95.0)
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site_a, site_b])
    
    out = engine.optimize(inp)
    assert out.status == OptimizerStatus.FULLY_COVERED
    assert len(out.allocations) == 2
    assert out.allocations[0].site_id == site_b.site_id
    assert out.allocations[0].population == 1000
    assert out.allocations[1].site_id == site_a.site_id
    assert out.allocations[1].population == 500

def test_zero_population(engine):
    hab = create_mock_habitation(population=0)
    site = create_mock_site("Site A", capacity=1000)
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site])
    
    out = engine.optimize(inp)
    assert out.status == OptimizerStatus.FULLY_COVERED
    assert out.allocated_population == 0
    assert out.coverage_percentage == 100.0

def test_exact_capacity_match(engine):
    hab = create_mock_habitation(population=1000)
    site = create_mock_site("Site A", capacity=1000)
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site])
    
    out = engine.optimize(inp)
    assert out.status == OptimizerStatus.FULLY_COVERED
    assert out.allocated_population == 1000
    assert out.uncovered_population == 0

def test_multiple_rejected_sites(engine):
    hab = create_mock_habitation(population=1000)
    site1 = create_mock_site("Unsafe Site", capacity=1000, status=OptimizerSiteStatus.UNSAFE)
    site2 = create_mock_site("Full Site", capacity=0, status=OptimizerSiteStatus.ACTIVE)
    site3 = create_mock_site("High Hazard Site", capacity=1000, status=OptimizerSiteStatus.ACTIVE, hazard_exposure=90.0)
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site1, site2, site3])
    out = engine.optimize(inp)
    
    assert out.status == OptimizerStatus.NO_SAFE_SITE
    assert len(out.rejected_sites) == 3
    reasons = [r.reason for r in out.rejected_sites]
    assert any("UNSAFE" in r for r in reasons)
    assert any("zero" in r.lower() for r in reasons)
    assert any("exceeds threshold" in r for r in reasons)

from pydantic import ValidationError

def test_scoring_config_validation():
    with pytest.raises(ValidationError):
        ScoringConfig(safety_weight=0.99, capacity_weight=0.99)

def test_tie_breaking_stability(engine):
    hab = create_mock_habitation(population=1000)
    # Both sites have exact same distance (they are at the same location) and same score
    site_x = create_mock_site("Site X", capacity=500, lat=20.1, lon=80.1, safety=90.0)
    site_y = create_mock_site("Site Y", capacity=500, lat=20.1, lon=80.1, safety=90.0)
    
    # We force site_y's UUID to be lexicographically smaller than site_x's UUID
    site_y = site_y.model_copy(update={'site_id': uuid4()})
    site_x = site_x.model_copy(update={'site_id': uuid4()})
    
    while str(site_x.site_id) < str(site_y.site_id):
        site_x = site_x.model_copy(update={'site_id': uuid4()})
        site_y = site_y.model_copy(update={'site_id': uuid4()})
        
    # Now site_y is strictly smaller than site_x. Since reverse=True, the larger string goes FIRST.
    # So site_x should be allocated first.
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site_y, site_x])
    out = engine.optimize(inp)
    
    assert out.allocations[0].site_id == site_x.site_id
    assert out.allocations[1].site_id == site_y.site_id
