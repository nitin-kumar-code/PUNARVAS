import pytest
import uuid
from unittest.mock import patch
from app.optimization.engine import get_engine, ScoringConfig, OR_TOOLS_AVAILABLE
from app.optimization.schemas import (
    OptimizerInput,
    OptimizerHabitation,
    OptimizerCandidateSite,
    OptimizerSiteStatus
)

@pytest.fixture
def ortools_engine():
    config = ScoringConfig(optimization_mode="ortools")
    return get_engine(config)

@pytest.fixture
def baseline_engine():
    config = ScoringConfig(optimization_mode="baseline")
    return get_engine(config)

def create_mock_hab(pop: int, lat: float=20.0, lon: float=80.0) -> OptimizerHabitation:
    return OptimizerHabitation(
        habitation_id=str(uuid.uuid4()),
        population=pop,
        vulnerable_population=int(pop * 0.1),
        latitude=lat,
        longitude=lon,
        risk_score=90.0,
        primary_hazard="FLOOD"
    )

def create_mock_site(capacity: int, status: OptimizerSiteStatus, score: float = 80.0, lat: float=20.1, lon: float=80.1) -> OptimizerCandidateSite:
    return OptimizerCandidateSite(
        site_id=str(uuid.uuid4()),
        name="Test Site",
        latitude=lat,
        longitude=lon,
        total_capacity=capacity,
        available_capacity=capacity,
        safety_score=score,
        accessibility_score=0.0,
        infrastructure_score=0.0,
        community_score=0.0,
        status=status
    )

def test_unsafe_sites_never_receive_population(ortools_engine):
    hab = create_mock_hab(100)
    site_safe = create_mock_site(50, OptimizerSiteStatus.ACTIVE, score=50.0)
    site_unsafe = create_mock_site(500, OptimizerSiteStatus.UNSAFE, score=90.0)
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site_safe, site_unsafe])
    out = ortools_engine.optimize(inp)
    
    assert out.allocated_population == 50
    assert len(out.allocations) == 1
    assert out.allocations[0].site_id == site_safe.site_id
    assert any(r.site_id == site_unsafe.site_id for r in out.rejected_sites)

def test_capacity_never_exceeded(ortools_engine):
    hab = create_mock_hab(1000)
    site_1 = create_mock_site(200, OptimizerSiteStatus.ACTIVE)
    site_2 = create_mock_site(300, OptimizerSiteStatus.ACTIVE)
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site_1, site_2])
    out = ortools_engine.optimize(inp)
    
    assert out.allocated_population == 500
    for alloc in out.allocations:
        if alloc.site_id == site_1.site_id:
            assert alloc.population == 200
        elif alloc.site_id == site_2.site_id:
            assert alloc.population == 300

def test_population_never_over_allocated(ortools_engine):
    hab = create_mock_hab(100)
    site_1 = create_mock_site(500, OptimizerSiteStatus.ACTIVE)
    site_2 = create_mock_site(500, OptimizerSiteStatus.ACTIVE)
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site_1, site_2])
    out = ortools_engine.optimize(inp)
    
    assert out.allocated_population == 100
    assert sum(a.population for a in out.allocations) == 100

def test_full_coverage_when_feasible(ortools_engine):
    hab = create_mock_hab(500)
    site_1 = create_mock_site(300, OptimizerSiteStatus.ACTIVE)
    site_2 = create_mock_site(200, OptimizerSiteStatus.ACTIVE)
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site_1, site_2])
    out = ortools_engine.optimize(inp)
    
    assert out.allocated_population == 500
    assert out.status == "FULLY_COVERED"

def test_max_coverage_when_impossible(ortools_engine):
    hab = create_mock_hab(1000)
    site_1 = create_mock_site(100, OptimizerSiteStatus.ACTIVE)
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[site_1])
    out = ortools_engine.optimize(inp)
    
    assert out.allocated_population == 100
    assert out.uncovered_population == 900
    assert out.status == "INSUFFICIENT_CAPACITY"

def test_results_match_baseline(ortools_engine, baseline_engine):
    hab = create_mock_hab(1000)
    s1 = create_mock_site(600, OptimizerSiteStatus.ACTIVE, score=90.0, lat=20.1, lon=80.1) # Best
    s2 = create_mock_site(600, OptimizerSiteStatus.ACTIVE, score=80.0, lat=20.2, lon=80.2) # Next best
    s3 = create_mock_site(600, OptimizerSiteStatus.UNSAFE, score=95.0, lat=20.1, lon=80.1) # Rejected
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[s1, s2, s3])
    
    out_ortools = ortools_engine.optimize(inp)
    out_baseline = baseline_engine.optimize(inp)
    
    assert out_ortools.allocated_population == 1000
    assert out_baseline.allocated_population == 1000
    
    assert out_ortools.allocations[0].site_id == s1.site_id
    assert out_ortools.allocations[0].population == 600
    assert out_ortools.allocations[1].site_id == s2.site_id
    assert out_ortools.allocations[1].population == 400
    
    assert out_ortools.allocations[0].site_id == out_baseline.allocations[0].site_id
    assert out_ortools.allocations[1].site_id == out_baseline.allocations[1].site_id
    assert out_ortools.allocations[0].population == out_baseline.allocations[0].population

def test_distance_never_overrides_score(ortools_engine, baseline_engine):
    # Setup a scenario where site A has a tiny score advantage but is VERY far away.
    # We'll use actual lat/lon differences to simulate this.
    # 1 degree of lat is roughly 111 km.
    hab = create_mock_hab(100, lat=0.0, lon=0.0)
    
    # Site A: Score 80.0, 5000 km away (~45 degrees)
    # The config defaults give: safety_weight=0.3. So safety_score=80 -> total score = 24.
    s1 = create_mock_site(100, OptimizerSiteStatus.ACTIVE, score=80.0, lat=45.0, lon=0.0)
    
    # Site B: Score 79.9, 10 km away (~0.1 degrees)
    # safety_score=79.0 -> total score = 23.7
    s2 = create_mock_site(100, OptimizerSiteStatus.ACTIVE, score=79.0, lat=0.1, lon=0.0)
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[s1, s2])
    
    out_ortools = ortools_engine.optimize(inp)
    out_baseline = baseline_engine.optimize(inp)
    
    # Both engines MUST pick s1 over s2 because of the higher score, despite the massive distance penalty.
    assert out_ortools.allocations[0].site_id == s1.site_id
    assert out_baseline.allocations[0].site_id == s1.site_id
    
    assert out_ortools.allocations[0].population == 100
    assert len(out_ortools.allocations) == 1

@patch('app.optimization.engine.pywraplp.Solver.CreateSolver')
def test_fallback_on_solver_creation_failure(mock_create_solver, ortools_engine):
    mock_create_solver.return_value = None
    
    hab = create_mock_hab(100)
    s1 = create_mock_site(100, OptimizerSiteStatus.ACTIVE, score=80.0)
    
    inp = OptimizerInput(source_habitation=hab, candidate_sites=[s1])
    out = ortools_engine.optimize(inp)
    
    # If the fallback failed, this would crash. Since it returns, fallback works.
    assert out.allocated_population == 100
    assert out.allocations[0].site_id == s1.site_id

@patch('app.optimization.engine.pywraplp.Solver.Solve')
def test_fallback_on_solver_infeasible(mock_solve, ortools_engine):
    # Mocking Solve directly might be tricky because we create the solver locally.
    # Instead, we'll patch the instance method of the created solver.
    with patch('ortools.linear_solver.pywraplp.Solver.Solve') as mock_solve_method:
        from ortools.linear_solver import pywraplp
        mock_solve_method.return_value = pywraplp.Solver.INFEASIBLE
        
        hab = create_mock_hab(100)
        s1 = create_mock_site(100, OptimizerSiteStatus.ACTIVE, score=80.0)
        
        inp = OptimizerInput(source_habitation=hab, candidate_sites=[s1])
        out = ortools_engine.optimize(inp)
        
        # Fallback to baseline gives 100 population.
        assert out.allocated_population == 100
        assert out.allocations[0].site_id == s1.site_id

