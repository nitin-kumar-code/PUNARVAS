from sqlalchemy.orm import Session
from app.services.habitation_service import HabitationService
from app.services.site_service import SiteService
from app.models.enums import RiskLevel, SiteStatus

class DashboardService:
    def __init__(self, db: Session = None):
        self.db = db
        self.hab_service = HabitationService(db)
        self.site_service = SiteService(db)

    def get_summary(self):
        # We need all records, so use a high limit
        habs = self.hab_service.get_all_habitations(limit=5000)
        sites = self.site_service.get_all_sites(limit=1000)
        
        total_habitations = len(habs)
        
        # Calculate risk distribution
        from collections import Counter
        risk_counts = Counter(h["risk_level"].value for h in habs if h.get("risk_level") is not None)
        
        risk_distribution = {
            "critical": risk_counts.get(RiskLevel.CRITICAL.value, 0),
            "high": risk_counts.get(RiskLevel.HIGH.value, 0),
            "medium": risk_counts.get(RiskLevel.MEDIUM.value, 0),
            "low": risk_counts.get(RiskLevel.LOW.value, 0),
        }
        unassigned_risk = total_habitations - sum(risk_distribution.values())
        if unassigned_risk > 0:
            risk_distribution["unassigned"] = unassigned_risk
        
        # Calculate populations
        vulnerable_population = sum(h.get("vulnerable_population", 0) or 0 for h in habs)
        total_pop = sum(h.get("total_population", 0) or 0 for h in habs)
        
        critical_pop = sum(h.get("total_population", 0) or 0 for h in habs if h.get("risk_level") == RiskLevel.CRITICAL)
        high_pop = sum(h.get("total_population", 0) or 0 for h in habs if h.get("risk_level") == RiskLevel.HIGH)
        immediate_relocation = critical_pop # Based on critical pop
        
        # Capacities
        # Using status == SiteStatus.ACTIVE based on site_service mapping of "safe"
        safe_relocation_capacity = sum(s.get("capacity_people", 0) or 0 for s in sites if s.get("status") == SiteStatus.ACTIVE)
        available_relocation_capacity = sum(s.get("available_capacity", 0) or 0 for s in sites if s.get("status") == SiteStatus.ACTIVE)
        
        # Average Risk Score
        scores = [h["risk_score"] for h in habs if h.get("risk_score") is not None]
        average_risk_score = round(sum(scores) / len(scores), 2) if scores else 0.0
        
        # Relocation Coverage
        at_risk_pop = critical_pop + high_pop
        relocation_coverage = round((safe_relocation_capacity / at_risk_pop) * 100, 2) if at_risk_pop > 0 else 100.0
        
        # Priorities (top 5)
        sorted_habs = sorted([h for h in habs if h.get("risk_score") is not None], key=lambda x: x["risk_score"], reverse=True)
        priority_habitations = []
        for h in sorted_habs[:5]:
            priority_habitations.append({
                "id": str(h["id"]),
                "name": h["name"],
                "population": h["total_population"],
                "risk_score": h["risk_score"]
            })
            
        immediate_candidates = self.hab_service.get_relocation_candidates(limit=50)

        return {
            "total_habitations": total_habitations,
            "critical_habitations": risk_distribution.get("critical", 0),
            "immediate_relocation": immediate_relocation,
            "vulnerable_population": vulnerable_population if vulnerable_population > 0 else None,
            "safe_relocation_capacity": safe_relocation_capacity,
            "available_relocation_capacity": available_relocation_capacity,
            "critical_population": critical_pop,
            "high_risk_population": high_pop,
            "average_risk_score": average_risk_score,
            "relocation_coverage": relocation_coverage,
            "risk_distribution": risk_distribution,
            "priority_habitations": priority_habitations,
            "immediate_relocation_candidates": immediate_candidates
        }
