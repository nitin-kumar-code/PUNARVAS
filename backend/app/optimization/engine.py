import math
import logging
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
from app.services.routing_service import RoutingService

logger = logging.getLogger(__name__)

try:
    from ortools.linear_solver import pywraplp
    OR_TOOLS_AVAILABLE = True
except ImportError:
    OR_TOOLS_AVAILABLE = False


class ScoringConfig(BaseModel):
    safety_weight: float = Field(0.30, ge=0.0, le=1.0)
    capacity_weight: float = Field(0.25, ge=0.0, le=1.0)
    accessibility_weight: float = Field(0.20, ge=0.0, le=1.0)
    infrastructure_weight: float = Field(0.15, ge=0.0, le=1.0)
    community_weight: float = Field(0.10, ge=0.0, le=1.0)
    hazard_exposure_threshold: float = Field(50.0, ge=0.0)
    optimization_mode: str = Field("ortools") # "baseline" or "ortools"
    
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
            route_info = RoutingService.get_route(source.latitude, source.longitude, site.latitude, site.longitude)
            dist = route_info["distance_km"]
            
            safe_sites.append({"site": site, "score": score, "distance": dist, "route_info": route_info})
            
        # Deterministic Ranking
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
                travel_time_minutes=item["route_info"]["duration_minutes"],
                routing_status=item["route_info"]["status"],
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


class ORToolsRelocationEngine(BaselineRelocationEngine):
    def optimize(self, input_data: OptimizerInput) -> OptimizerOutput:
        if not OR_TOOLS_AVAILABLE:
            logger.warning("OR-Tools is not available, falling back to BaselineRelocationEngine.")
            return super().optimize(input_data)
            
        source = input_data.source_habitation
        sites = input_data.candidate_sites
        
        rejected_sites: List[OptimizerRejectedSite] = []
        safe_sites_raw: List[Dict[str, Any]] = []
        
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
            route_info = RoutingService.get_route(source.latitude, source.longitude, site.latitude, site.longitude)
            dist = route_info["distance_km"]
            safe_sites_raw.append({"site": site, "score": score, "distance": dist, "route_info": route_info})

        if not safe_sites_raw or source.population <= 0:
            status = OptimizerStatus.NO_SAFE_SITE if source.population > 0 else OptimizerStatus.FULLY_COVERED
            return OptimizerOutput(
                source_habitation_id=source.habitation_id,
                source_population=source.population,
                vulnerable_population=source.vulnerable_population,
                allocated_population=0,
                uncovered_population=source.population,
                coverage_percentage=100.0 if source.population == 0 else 0.0,
                status=status,
                allocations=[],
                rejected_sites=rejected_sites
            )

        # Attempt to create the solver. If it fails, fallback to baseline.
        solver = pywraplp.Solver.CreateSolver('SCIP')
        if not solver:
            logger.warning("Could not create SCIP solver. Falling back to BaselineRelocationEngine.")
            return super().optimize(input_data)

        x_vars = []
        for item in safe_sites_raw:
            site = item["site"]
            x_vars.append(solver.IntVar(0, site.available_capacity, f'x_{site.site_id}'))

        solver.Add(sum(x_vars) <= source.population)
        
        objective = solver.Objective()
        
        # Primary Objective: Maximize allocated population. (Coefficient = 1.0)
        # Secondary Objective (Lexicographic ranking):
        # 1. Prefer higher scores.
        # 2. Prefer lower distances.
        # To strictly enforce lexicographic ordering: 
        # Base multiplier = 1.0 per person.
        # Epsilon for score (e.g. 1e-3). Max score is 100, so score_term ranges [0, 0.1].
        # Epsilon for distance MUST be smaller than the minimum possible score delta.
        # Distance (even 20,000 km) multiplied by 1e-8 will be <= 0.0002.
        # This prevents distance from overriding score, while keeping the total secondary term < 1.0.
        
        eps_score = 1e-3
        eps_dist = 1e-8
        
        for i, item in enumerate(safe_sites_raw):
            score = item["score"]
            dist = item["distance"]
            # To ensure the solver behaves safely, utility MUST be strictly less than 2.0 to not confuse 2 people vs 1 person.
            utility_per_person = 1.0 + (eps_score * score) - (eps_dist * dist)
            objective.SetCoefficient(x_vars[i], utility_per_person)
            
        objective.SetMaximization()
        
        status_solver = solver.Solve()

        if status_solver not in [pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE]:
            logger.warning(f"Solver failed to find a feasible solution: {status_solver}. Falling back.")
            return super().optimize(input_data)

        allocations: List[OptimizerAllocation] = []
        allocated_pop = 0

        for i, item in enumerate(safe_sites_raw):
            val = int(x_vars[i].solution_value())
            if val > 0:
                site = item["site"]
                percentage = round((val / source.population * 100.0), 2)
                allocations.append(OptimizerAllocation(
                    site_id=site.site_id,
                    population=val,
                    percentage=percentage,
                    distance_km=round(item["distance"], 2),
                    travel_time_minutes=item["route_info"]["duration_minutes"],
                    routing_status=item["route_info"]["status"],
                    site_score=round(item["score"], 2)
                ))
                allocated_pop += val

        coverage = round((allocated_pop / source.population * 100.0), 2) if source.population > 0 else 100.0

        if allocated_pop == source.population:
            status = OptimizerStatus.FULLY_COVERED
        elif allocated_pop == 0:
            status = OptimizerStatus.NO_SAFE_SITE
        else:
            status = OptimizerStatus.INSUFFICIENT_CAPACITY

        # Sort allocations deterministically, exactly matching the baseline convention
        allocations.sort(key=lambda a: (a.site_score, -a.distance_km, str(a.site_id)), reverse=True)

        return OptimizerOutput(
            source_habitation_id=source.habitation_id,
            source_population=source.population,
            vulnerable_population=source.vulnerable_population,
            allocated_population=allocated_pop,
            uncovered_population=source.population - allocated_pop,
            coverage_percentage=coverage,
            status=status,
            allocations=allocations,
            rejected_sites=rejected_sites
        )

# Factory to choose the correct engine
def get_engine(config: Optional[ScoringConfig] = None) -> BaselineRelocationEngine:
    config = config or ScoringConfig()
    if config.optimization_mode == "ortools":
        return ORToolsRelocationEngine(config)
    return BaselineRelocationEngine(config)
