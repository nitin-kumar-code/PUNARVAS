from typing import List
from app.optimization.interface import RelocationOptimizerProtocol
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.models.enums import SiteStatus
from app.schemas.intelligence import OptimizationResult, AllocationResult

class BaselineOptimizer(RelocationOptimizerProtocol):
    
    def _is_hazard_conflict(self, source_hazard: str, site: CandidateSite) -> bool:
        hazard = (source_hazard or "").upper()
        if hazard == "FLOOD" and site.flood_risk and site.flood_risk > 50.0:
            return True
        if hazard == "LANDSLIDE" and site.landslide_risk and site.landslide_risk > 50.0:
            return True
        if hazard == "EARTHQUAKE" and site.earthquake_risk and site.earthquake_risk > 50.0:
            return True
        return False

    def optimize(self, source: Habitation, sites: List[CandidateSite]) -> OptimizationResult:
        rejected_sites = []
        valid_sites = []
        
        # 1. Filter sites
        for site in sites:
            if site.status in [SiteStatus.UNSAFE, SiteStatus.FULL]:
                rejected_sites.append({"site_id": str(site.id), "site_name": site.name, "reason": f"Status is {site.status.value}"})
                continue
                
            if site.available_capacity <= 0:
                rejected_sites.append({"site_id": str(site.id), "site_name": site.name, "reason": "No available capacity"})
                continue
                
            if self._is_hazard_conflict(source.primary_hazard, site):
                rejected_sites.append({"site_id": str(site.id), "site_name": site.name, "reason": f"Hazard conflict: {source.primary_hazard}"})
                continue
                
            valid_sites.append(site)
            
        # 2. Sort by safety descending, then available capacity descending
        valid_sites.sort(key=lambda s: (s.overall_safety_score or 0, s.available_capacity or 0), reverse=True)
        
        # 3. Greedy Allocation
        allocations = []
        remaining_population = source.total_population or 0
        remaining_vulnerable = source.vulnerable_population or 0
        
        for site in valid_sites:
            if remaining_population <= 0:
                break
                
            alloc = min(remaining_population, site.available_capacity)
            vul_alloc = min(remaining_vulnerable, alloc) # Rough proportional alloc can be done, here we just max it out up to alloc
            
            allocations.append(AllocationResult(
                site_id=site.id,
                site_name=site.name,
                population=alloc,
                vulnerable_population=vul_alloc,
                allocation_percentage=round((alloc / source.total_population) * 100, 2) if source.total_population else 100.0
            ))
            
            remaining_population -= alloc
            remaining_vulnerable -= vul_alloc
            
        coverage = 100.0
        if source.total_population and source.total_population > 0:
            allocated_total = sum(a.population for a in allocations)
            coverage = round((allocated_total / source.total_population) * 100, 2)
            
        return OptimizationResult(
            allocations=allocations,
            rejected_sites=rejected_sites,
            coverage_percentage=coverage,
            total_travel_time=0.0
        )
