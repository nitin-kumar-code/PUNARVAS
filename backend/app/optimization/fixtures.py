from uuid import UUID
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

def get_example_optimizer_input() -> OptimizerInput:
    hab = OptimizerHabitation(
        habitation_id=UUID("12345678-1234-5678-1234-567812345678"),
        population=1000,
        vulnerable_population=300,
        latitude=26.75,
        longitude=94.20,
        risk_score=85.5,
        risk_level="HIGH",
        primary_hazard="FLOOD"
    )
    
    site1 = OptimizerCandidateSite(
        site_id=UUID("87654321-4321-8765-4321-876543210987"),
        name="Safe Zone Alpha",
        latitude=26.80,
        longitude=94.25,
        total_capacity=1000,
        available_capacity=500,
        safety_score=95.0,
        accessibility_score=80.0,
        infrastructure_score=85.0,
        healthcare_score=75.0,
        community_score=90.0,
        hazard_exposure=10.0,
        status=OptimizerSiteStatus.ACTIVE
    )
    
    site2 = OptimizerCandidateSite(
        site_id=UUID("11111111-2222-3333-4444-555555555555"),
        name="Lowlands Camp",
        latitude=26.78,
        longitude=94.22,
        total_capacity=2000,
        available_capacity=1500,
        safety_score=40.0,
        accessibility_score=60.0,
        infrastructure_score=50.0,
        healthcare_score=40.0,
        community_score=50.0,
        hazard_exposure=85.0,
        status=OptimizerSiteStatus.ACTIVE
    )
    
    return OptimizerInput(source_habitation=hab, candidate_sites=[site1, site2])

def get_example_optimizer_output() -> OptimizerOutput:
    alloc = OptimizerAllocation(
        site_id=UUID("87654321-4321-8765-4321-876543210987"),
        population=500,
        percentage=50.0,
        distance_km=7.5,
        site_score=95.0
    )
    
    rejected = OptimizerRejectedSite(
        site_id=UUID("11111111-2222-3333-4444-555555555555"),
        reason="Hazard conflict: High flood risk",
        hazard_exposure_info=HazardExposureInfo(exposure=85.0)
    )
    
    return OptimizerOutput(
        source_habitation_id=UUID("12345678-1234-5678-1234-567812345678"),
        source_population=1000,
        vulnerable_population=300,
        allocated_population=500,
        uncovered_population=500,
        coverage_percentage=50.0,
        status=OptimizerStatus.INSUFFICIENT_CAPACITY,
        allocations=[alloc],
        rejected_sites=[rejected]
    )
