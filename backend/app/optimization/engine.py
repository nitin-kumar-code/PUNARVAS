import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, model_validator
from app.optimization.schemas import (
    OptimizerInput,
    OptimizerOutput,
    OptimizerStatus,
    OptimizerSiteStatus,
    OptimizerRejectedSite,
    OptimizerAllocation,
    OptimizerCandidateSite,
    HazardExposureInfo
)

class ScoringConfig(BaseModel):
    safety_weight: float = Field(0.30, ge=0.0, le=1.0)
    capacity_weight: float = Field(0.25, ge=0.0, le=1.0)
    accessibility_weight: float = Field(0.20, ge=0.0, le=1.0)
    infrastructure_weight: float = Field(0.15, ge=0.0, le=1.0)
    community_weight: float = Field(0.10, ge=0.0, le=1.0)
    hazard_exposure_threshold: float = Field(50.0, ge=0.0)
    
    @model_validator(mode='after')
    def validate_weights_sum(self):
        total = sum([
            self.safety_weight, 
            self.capacity_weight, 
            self.accessibility_weight, 
            self.infrastructure_weight, 
            self.community_weight
        ])
        if not math.isclose(total, 1.0, rel_tol=1e-5):
            raise ValueError(f"Scoring weights must sum to 1.0, got {total}")
        return self

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class BaselineRelocationEngine:
    def __init__(self, config: Optional[ScoringConfig] = None):
        self.config = config or ScoringConfig()

    def _calculate_site_score(self, site: OptimizerCandidateSite) -> float:
        # Note: Unassessed sites (None) default to 0.0, aggressively penalizing them in the baseline algorithm.
        safety = site.safety_score or 0.0
        acc = site.accessibility_score or 0.0
        infra = site.infrastructure_score or 0.0
        comm = site.community_score or 0.0
        
        if site.total_capacity > 0:
            cap_score = (site.available_capacity / site.total_capacity) * 100.0
        else:
            cap_score = 0.0
            
        return (
            safety * self.config.safety_weight +
            cap_score * self.config.capacity_weight +
            acc * self.config.accessibility_weight +
            infra * self.config.infrastructure_weight +
            comm * self.config.community_weight
        )

    def optimize(self, input_data: OptimizerInput) -> OptimizerOutput:
        source = input_data.source_habitation
        sites = input_data.candidate_sites
        
        rejected_sites: List[OptimizerRejectedSite] = []
        safe_sites: List[Dict[str, Any]] = []
        
        for site in sites:
            if site.status in [OptimizerSiteStatus.UNSAFE, OptimizerSiteStatus.UNAVAILABLE, OptimizerSiteStatus.FULL]:
                rejected_sites.append(OptimizerRejectedSite(site_id=site.site_id, reason=f"Status is {site.status.value}"))
                continue
            if site.available_capacity <= 0:
                rejected_sites.append(OptimizerRejectedSite(site_id=site.site_id, reason="Available capacity is zero or less"))
                continue
            if site.hazard_exposure is not None and site.hazard_exposure > self.config.hazard_exposure_threshold:
                rejected_sites.append(OptimizerRejectedSite(
                    site_id=site.site_id, 
                    reason=f"Hazard exposure ({site.hazard_exposure}) exceeds threshold",
                    hazard_exposure_info=HazardExposureInfo(exposure=site.hazard_exposure)
                ))
                continue
                
            score = self._calculate_site_score(site)
            dist = haversine_distance(source.latitude, source.longitude, site.latitude, site.longitude)
            
            safe_sites.append({"site": site, "score": score, "distance": dist})
            
        # Deterministic Ranking: score descending, distance ascending, site_id ascending for ultimate tie-break stability
        safe_sites.sort(key=lambda x: (x["score"], -x["distance"], str(x["site"].site_id)), reverse=True)
        
        allocations: List[OptimizerAllocation] = []
        remaining_pop = source.population
        allocated_pop = 0
        
        for item in safe_sites:
            if remaining_pop <= 0:
                break
                
            site = item["site"]
            alloc = min(remaining_pop, site.available_capacity)
            percentage = round((alloc / source.population * 100.0), 2) if source.population > 0 else 0.0
            
            allocations.append(OptimizerAllocation(
                site_id=site.site_id,
                population=alloc,
                percentage=percentage,
                distance_km=round(item["distance"], 2),
                site_score=round(item["score"], 2)
            ))
            
            allocated_pop += alloc
            remaining_pop -= alloc
            
        coverage = round((allocated_pop / source.population * 100.0), 2) if source.population > 0 else 100.0
        
        if source.population == 0 or allocated_pop == source.population:
            status = OptimizerStatus.FULLY_COVERED
        elif allocated_pop == 0:
            status = OptimizerStatus.NO_SAFE_SITE
        else:
            # Baseline engine greedy-allocates until capacity or pop is exhausted.
            # If uncovered_pop > 0, we genuinely ran out of safe capacity system-wide.
            status = OptimizerStatus.INSUFFICIENT_CAPACITY
            
        return OptimizerOutput(
            source_habitation_id=source.habitation_id,
            source_population=source.population,
            vulnerable_population=source.vulnerable_population,
            allocated_population=allocated_pop,
            uncovered_population=remaining_pop,
            coverage_percentage=coverage,
            status=status,
            allocations=allocations,
            rejected_sites=rejected_sites
        )
