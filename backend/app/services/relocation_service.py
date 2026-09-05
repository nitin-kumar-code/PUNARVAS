import logging
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from pydantic import ValidationError
from app.optimization.engine import get_engine
from app.services.habitation_service import HabitationService
from app.services.site_service import SiteService
from app.optimization.schemas import (
    OptimizerHabitation,
    OptimizerCandidateSite,
    OptimizerInput,
    OptimizerOutput,
    OptimizerSiteStatus
)

logger = logging.getLogger(__name__)

class RelocationService:
    def __init__(self, db: Session):
        self.db = db
        self.engine = get_engine()
        self.hab_service = HabitationService(db)
        self.site_service = SiteService(db)
        
    def recommend_relocation(self, habitation_id: UUID) -> OptimizerOutput:
        # 1. Fetch habitation information
        habitation_dict = self.hab_service.get_habitation_by_id(habitation_id)
        if not habitation_dict:
            raise HTTPException(status_code=404, detail="Habitation not found")
            
        # 2. Guard opt_hab construction
        try:
            opt_hab = OptimizerHabitation(
                habitation_id=habitation_dict["id"],
                population=habitation_dict.get("total_population", 0) or 0,
                vulnerable_population=habitation_dict.get("vulnerable_population", 0) or 0,
                latitude=habitation_dict.get("latitude", 0.0) or 0.0,
                longitude=habitation_dict.get("longitude", 0.0) or 0.0,
                risk_score=habitation_dict.get("risk_score"),
                risk_level=habitation_dict.get("risk_level").value if habitation_dict.get("risk_level") else None,
                primary_hazard=habitation_dict.get("primary_hazard")
            )
        except ValidationError as e:
            logger.error(f"Habitation {habitation_id} fails Optimizer contract: {e}")
            raise HTTPException(status_code=500, detail="Internal data integrity error on source habitation")
            
        # 3. Fetch candidate relocation sites
        db_sites = self.site_service.get_all_sites()
        if not db_sites:
            raise HTTPException(status_code=400, detail="No candidate sites available")
            
        # 4. Expsoures dict is empty because DB is empty
        exposures_dict = {}
            
        opt_sites = []
        for db_site in db_sites:
            try:
                status_enum = OptimizerSiteStatus(db_site.get("status").value.upper())
            except Exception as e:
                logger.warning(f"Candidate site {db_site.get('id')} has unrecognized status. Error: {e}")
                status_enum = OptimizerSiteStatus.UNAVAILABLE
                
            try:
                opt_site = OptimizerCandidateSite(
                    site_id=db_site["id"],
                    name=db_site.get("name", ""),
                    latitude=db_site.get("latitude", 0.0) or 0.0,
                    longitude=db_site.get("longitude", 0.0) or 0.0,
                    total_capacity=db_site.get("capacity_people", 0) or 0,
                    available_capacity=db_site.get("available_capacity", 0) or 0,
                    safety_score=db_site.get("overall_safety_score"),
                    accessibility_score=db_site.get("accessibility_score"),
                    infrastructure_score=db_site.get("infrastructure_score"),
                    healthcare_score=db_site.get("healthcare_score"),
                    community_score=db_site.get("community_score"),
                    hazard_exposure=exposures_dict.get(db_site["id"], 0.0),
                    status=status_enum
                )
                opt_sites.append(opt_site)
            except ValidationError as e:
                logger.warning(
                    f"Candidate site {db_site['id']} fails Optimizer contract and will be excluded. Error: {e}"
                )
                continue
                
        if not opt_sites:
            raise HTTPException(status_code=500, detail="No valid candidate sites remaining after validation")
            
        # 5. Construct OptimizerInput
        try:
            opt_input = OptimizerInput(
                source_habitation=opt_hab,
                candidate_sites=opt_sites
            )
        except ValidationError as e:
            logger.error(f"Failed to assemble OptimizerInput: {e}")
            raise HTTPException(status_code=500, detail="Internal data alignment error")
        
        # 6. Call the optimization service
        try:
            opt_output = self.engine.optimize(opt_input)
        except Exception as e:
            logger.error(f"Optimizer internal crash: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal optimization failure")
            
        return opt_output
