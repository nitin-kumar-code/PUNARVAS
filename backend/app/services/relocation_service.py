from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.optimization.baseline import BaselineOptimizer
from app.schemas.intelligence import RelocationRecommendationResponse

class RelocationService:
    def __init__(self, db: Session):
        self.db = db
        self.optimizer = BaselineOptimizer()
        
    def recommend_relocation(self, habitation_id: UUID) -> RelocationRecommendationResponse:
        habitation = self.db.query(Habitation).filter(Habitation.id == habitation_id).first()
        if not habitation:
            raise HTTPException(status_code=404, detail="Habitation not found")
            
        all_sites = self.db.query(CandidateSite).all()
        
        # Call Optimization Interface
        opt_result = self.optimizer.optimize(habitation, all_sites)
        
        # Build response
        site_dicts = []
        for a in opt_result.allocations:
            site_dicts.append({
                "site_id": str(a.site_id),
                "site_name": a.site_name,
                "score": next((s.overall_safety_score for s in all_sites if s.id == a.site_id), 0),
                "recommendation": "RECOMMENDED",
                "reasons": ["High safety score", "Sufficient capacity"]
            })
            
        for r in opt_result.rejected_sites:
            site_dicts.append({
                "site_id": r["site_id"],
                "site_name": r["site_name"],
                "score": next((s.overall_safety_score for s in all_sites if str(s.id) == r["site_id"]), 0),
                "recommendation": "REJECTED",
                "reasons": [r["reason"]]
            })
            
        return RelocationRecommendationResponse(
            source_habitation={
                "id": str(habitation.id),
                "name": habitation.name,
                "population": habitation.total_population,
                "primary_hazard": habitation.primary_hazard
            },
            candidate_sites=site_dicts,
            optimization_result=opt_result
        )
