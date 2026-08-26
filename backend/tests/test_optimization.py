import pytest
from app.optimization.baseline import BaselineOptimizer
from app.optimization.interface import RelocationOptimizerProtocol
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.models.enums import SiteStatus
import uuid

def test_optimizer_protocol_conformance():
    opt = BaselineOptimizer()
    assert isinstance(opt, RelocationOptimizerProtocol)

def test_multi_site_allocation():
    opt = BaselineOptimizer()
    source = Habitation(
        id=uuid.uuid4(),
        total_population=1840,
        vulnerable_population=500,
        primary_hazard="FLOOD"
    )
    
    site_b = CandidateSite(
        id=uuid.uuid4(),
        name="Site B",
        status=SiteStatus.ACTIVE,
        available_capacity=1000,
        overall_safety_score=90.0,
        flood_risk=10.0
    )
    
    site_d = CandidateSite(
        id=uuid.uuid4(),
        name="Site D",
        status=SiteStatus.ACTIVE,
        available_capacity=840,
        overall_safety_score=80.0,
        flood_risk=10.0
    )
    
    result = opt.optimize(source, [site_b, site_d])
    
    assert len(result.allocations) == 2
    assert result.coverage_percentage == 100.0
    assert result.allocations[0].population == 1000
    assert result.allocations[1].population == 840
    assert not result.rejected_sites

def test_hazard_conflict_rejection():
    opt = BaselineOptimizer()
    source = Habitation(
        id=uuid.uuid4(),
        total_population=500,
        primary_hazard="FLOOD"
    )
    
    site_c = CandidateSite(
        id=uuid.uuid4(),
        name="Site C",
        status=SiteStatus.ACTIVE,
        available_capacity=1000,
        overall_safety_score=90.0,
        flood_risk=80.0  # Conflict
    )
    
    result = opt.optimize(source, [site_c])
    assert len(result.allocations) == 0
    assert len(result.rejected_sites) == 1
    assert "FLOOD" in result.rejected_sites[0]["reason"]

def test_shortfall_allocation():
    opt = BaselineOptimizer()
    source = Habitation(
        id=uuid.uuid4(),
        total_population=1000,
    )
    site = CandidateSite(
        id=uuid.uuid4(),
        name="Site",
        status=SiteStatus.ACTIVE,
        available_capacity=600,
    )
    
    result = opt.optimize(source, [site])
    assert len(result.allocations) == 1
    assert result.allocations[0].population == 600
    assert result.coverage_percentage == 60.0
