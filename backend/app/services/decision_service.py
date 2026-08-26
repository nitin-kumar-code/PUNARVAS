from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException
from app.models.habitation import Habitation
from app.models.relocation_plan import RelocationPlan
from app.models.allocation import Allocation
from app.models.decision_receipt import DecisionReceipt
from app.models.enums import RelocationStatus
from app.services.relocation_service import RelocationService

class DecisionService:
    def __init__(self, db: Session):
        self.db = db
        self.relocation_service = RelocationService(db)
        
    def generate_decision(self, habitation_id: UUID):
        habitation = self.db.query(Habitation).filter(Habitation.id == habitation_id).first()
        if not habitation:
            raise HTTPException(status_code=404, detail="Habitation not found")
            
        # 1. Run optimization to get the plan
        rec = self.relocation_service.recommend_relocation(habitation_id)
        opt_result = rec.optimization_result
        
        # 2. Save RelocationPlan
        plan = RelocationPlan(
            source_habitation_id=habitation.id,
            total_population=habitation.total_population,
            vulnerable_population=habitation.vulnerable_population,
            status=RelocationStatus.DRAFT,
            total_travel_time=opt_result.total_travel_time,
            coverage_percentage=opt_result.coverage_percentage
        )
        self.db.add(plan)
        self.db.flush() # Get plan.id
        
        # 3. Save Allocations and deduct capacity
        for alloc in opt_result.allocations:
            db_alloc = Allocation(
                relocation_plan_id=plan.id,
                candidate_site_id=alloc.site_id,
                population_allocated=alloc.population,
                vulnerable_population_allocated=alloc.vulnerable_population,
                travel_time_minutes=0.0,
                allocation_percentage=alloc.allocation_percentage
            )
            self.db.add(db_alloc)
            
            # Since this is an actual decision being recorded, we theoretically update site capacity here
            # But the user said "do not automatically relocate anyone, just flag/generate plan".
            # For this MVP phase, we just record the allocation.

        # 4. Generate Immutable Evidence JSON
        evidence = {
            "source": rec.source_habitation,
            "risk_snapshot": {
                "score": habitation.risk_score,
                "level": habitation.risk_level.value if habitation.risk_level else None
            },
            "optimization": opt_result.model_dump(mode='json'),
            "candidate_evaluations": rec.candidate_sites
        }
        
        # 5. Save DecisionReceipt
        receipt = DecisionReceipt(
            relocation_plan_id=plan.id,
            decision_type="RELOCATION_RECOMMENDATION",
            decision_summary=f"Automated relocation plan covering {opt_result.coverage_percentage}% of population.",
            risk_score=habitation.risk_score,
            primary_reason="System detected critical risk thresholds.",
            evidence=evidence,
            confidence_score=90.0,
            generated_at=datetime.now(timezone.utc)
        )
        self.db.add(receipt)
        
        self.db.commit()
        self.db.refresh(receipt)
        
        return receipt
