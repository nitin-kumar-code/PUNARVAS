import pytest
from uuid import uuid4
from pydantic import ValidationError
from app.optimization.schemas import (
    OptimizerHabitation,
    OptimizerCandidateSite,
    OptimizerInput,
    OptimizerAllocation,
    OptimizerRejectedSite,
    OptimizerOutput,
    OptimizerStatus,
    OptimizerSiteStatus,
    HazardExposureInfo
)

def test_valid_input():
    hab_id = uuid4()
    site_id = uuid4()
    
    hab = OptimizerHabitation(
        habitation_id=hab_id,
        population=1000,
        vulnerable_population=300,
        latitude=20.0,
        longitude=80.0,
        risk_score=75.0,
        risk_level="HIGH",
        primary_hazard="FLOOD"
    )
    
    site = OptimizerCandidateSite(
        site_id=site_id,
        name="Safe Zone A",
        latitude=20.1,
        longitude=80.1,
        total_capacity=1000,
        available_capacity=500,
        safety_score=90.0,
        accessibility_score=85.0,
        infrastructure_score=80.0,
        healthcare_score=75.0,
        community_score=70.0,
        hazard_exposure=10.0,
        status=OptimizerSiteStatus.ACTIVE
    )
    
    opt_input = OptimizerInput(source_habitation=hab, candidate_sites=[site])
    assert opt_input.source_habitation.population == 1000
    assert len(opt_input.candidate_sites) == 1

def test_invalid_population():
    with pytest.raises(ValidationError):
        # Negative population
        OptimizerHabitation(
            habitation_id=uuid4(),
            population=-100,
            vulnerable_population=50,
            latitude=20.0,
            longitude=80.0
        )
        
    with pytest.raises(ValidationError) as exc:
        # Vulnerable > total
        OptimizerHabitation(
            habitation_id=uuid4(),
            population=100,
            vulnerable_population=150,
            latitude=20.0,
            longitude=80.0
        )
    assert "vulnerable_population cannot exceed population" in str(exc.value)

def test_invalid_capacity():
    with pytest.raises(ValidationError):
        # Negative capacity
        OptimizerCandidateSite(
            site_id=uuid4(),
            name="Test",
            latitude=20.0,
            longitude=80.0,
            total_capacity=-50,
            available_capacity=0,
            status=OptimizerSiteStatus.ACTIVE
        )
        
    with pytest.raises(ValidationError) as exc:
        # Available > total
        OptimizerCandidateSite(
            site_id=uuid4(),
            name="Test",
            latitude=20.0,
            longitude=80.0,
            total_capacity=500,
            available_capacity=600,
            status=OptimizerSiteStatus.ACTIVE
        )
    assert "available_capacity cannot exceed total_capacity" in str(exc.value)

@pytest.mark.parametrize("invalid_score", [-10.0, 105.0])
def test_invalid_scores(invalid_score):
    with pytest.raises(ValidationError):
        OptimizerHabitation(
            habitation_id=uuid4(),
            population=100,
            vulnerable_population=50,
            latitude=20.0,
            longitude=80.0,
            risk_score=invalid_score
        )
        
    with pytest.raises(ValidationError):
        OptimizerCandidateSite(
            site_id=uuid4(),
            name="Test",
            latitude=20.0,
            longitude=80.0,
            total_capacity=500,
            available_capacity=200,
            safety_score=invalid_score,
            status=OptimizerSiteStatus.ACTIVE
        )

def test_fully_covered_output():
    site_id = uuid4()
    hab_id = uuid4()
    alloc = OptimizerAllocation(
        site_id=site_id,
        population=1000,
        percentage=100.0,
        distance_km=5.0,
        site_score=95.0
    )
    
    out = OptimizerOutput(
        source_habitation_id=hab_id,
        source_population=1000,
        vulnerable_population=300,
        allocated_population=1000,
        uncovered_population=0,
        coverage_percentage=100.0,
        status=OptimizerStatus.FULLY_COVERED,
        allocations=[alloc],
        rejected_sites=[]
    )
    assert out.status == OptimizerStatus.FULLY_COVERED
    assert out.coverage_percentage == 100.0

def test_insufficient_capacity_output():
    site_id = uuid4()
    hab_id = uuid4()
    alloc = OptimizerAllocation(
        site_id=site_id,
        population=500,
        percentage=50.0,
        distance_km=5.0,
        site_score=95.0
    )
    
    out = OptimizerOutput(
        source_habitation_id=hab_id,
        source_population=1000,
        vulnerable_population=300,
        allocated_population=500,
        uncovered_population=500,
        coverage_percentage=50.0,
        status=OptimizerStatus.INSUFFICIENT_CAPACITY,
        allocations=[alloc],
        rejected_sites=[]
    )
    assert out.status == OptimizerStatus.INSUFFICIENT_CAPACITY
    assert out.coverage_percentage == 50.0

def test_rejected_site_representation():
    site_id = uuid4()
    hab_id = uuid4()
    
    rejected = OptimizerRejectedSite(
        site_id=site_id,
        reason="Hazard conflict",
        hazard_exposure_info=HazardExposureInfo(exposure=95.0)
    )
    
    out = OptimizerOutput(
        source_habitation_id=hab_id,
        source_population=1000,
        vulnerable_population=300,
        allocated_population=0,
        uncovered_population=1000,
        coverage_percentage=0.0,
        status=OptimizerStatus.NO_SAFE_SITE,
        allocations=[],
        rejected_sites=[rejected]
    )
    
    assert len(out.rejected_sites) == 1
    assert out.rejected_sites[0].reason == "Hazard conflict"
    assert out.rejected_sites[0].hazard_exposure_info.exposure == 95.0

def test_invalid_output_invariants():
    # Sum of allocated + uncovered != source
    with pytest.raises(ValidationError):
        OptimizerOutput(
            source_habitation_id=uuid4(),
            source_population=1000,
            vulnerable_population=0,
            allocated_population=500,
            uncovered_population=0, # Incorrect, should be 500
            coverage_percentage=50.0,
            status=OptimizerStatus.INVALID_INPUT,
            allocations=[],
            rejected_sites=[]
        )
        
    # sum of allocations.population != allocated_population
    with pytest.raises(ValidationError):
        alloc = OptimizerAllocation(
            site_id=uuid4(),
            population=200,
            percentage=20.0,
            distance_km=5.0,
            site_score=95.0
        )
        OptimizerOutput(
            source_habitation_id=uuid4(),
            source_population=1000,
            vulnerable_population=0,
            allocated_population=500, # Matches uncovered below, but alloc object says 200
            uncovered_population=500,
            coverage_percentage=50.0,
            status=OptimizerStatus.INVALID_INPUT,
            allocations=[alloc],
            rejected_sites=[]
        )

def test_invalid_coverage_percentage():
    alloc = OptimizerAllocation(
        site_id=uuid4(),
        population=500,
        percentage=50.0,
        distance_km=5.0,
        site_score=95.0
    )
    with pytest.raises(ValidationError) as exc:
        OptimizerOutput(
            source_habitation_id=uuid4(),
            source_population=1000,
            vulnerable_population=300,
            allocated_population=500,
            uncovered_population=500,
            coverage_percentage=99.0, # Wrong, should be 50.0
            status=OptimizerStatus.INSUFFICIENT_CAPACITY,
            allocations=[alloc],
            rejected_sites=[]
        )
    assert "coverage_percentage (99.0) inconsistent with allocated/source population" in str(exc.value)
