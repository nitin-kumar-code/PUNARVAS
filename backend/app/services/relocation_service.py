import logging
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from pydantic import ValidationError
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.models.site_hazard_exposure import SiteHazardExposure
from app.optimization.engine import get_engine
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
        
    def recommend_relocation(self, habitation_id: UUID) -> OptimizerOutput:
        # 1. Fetch habitation information
        habitation = self.db.query(Habitation).filter(Habitation.id == habitation_id).first()
        if not habitation:
            raise HTTPException(status_code=404, detail="Habitation not found")
            
        # 2. Guard opt_hab construction
        try:
            opt_hab = OptimizerHabitation(
                habitation_id=habitation.id,
                population=habitation.total_population or 0,
                vulnerable_population=habitation.vulnerable_population or 0,
                latitude=habitation.latitude,
                longitude=habitation.longitude,
                risk_score=habitation.risk_score,
                risk_level=habitation.risk_level.value if habitation.risk_level else None,
                primary_hazard=habitation.primary_hazard
            )
        except ValidationError as e:
            logger.error(f"DB Habitation {habitation.id} fails Optimizer contract: {e}")
            raise HTTPException(status_code=500, detail="Internal data integrity error on source habitation")
            
        # 3. Fetch candidate relocation sites
        db_sites = self.db.query(CandidateSite).all()
        if not db_sites:
            raise HTTPException(status_code=400, detail="No candidate sites available")
            
        # 4. Fetch ALL relevant hazard exposures in ONE batched query
        exposures_dict = {}
        if habitation.primary_hazard:
            site_ids = [s.id for s in db_sites]
            exposures = self.db.query(SiteHazardExposure).filter(
                SiteHazardExposure.site_id.in_(site_ids),
                SiteHazardExposure.hazard_type == habitation.primary_hazard
            ).all()
            
            exposures_dict = {exp.site_id: exp.exposure_score for exp in exposures}
            
        opt_sites = []
        for db_site in db_sites:
            # Safe status extraction with strict logging
            try:
                status_enum = OptimizerSiteStatus(db_site.status.value.upper())
            except ValueError as e:
                logger.warning(
                    f"Candidate site {db_site.id} has unrecognized status '{db_site.status.value}'. "
                    f"Defaulting to UNAVAILABLE. Error: {e}"
                )
                status_enum = OptimizerSiteStatus.UNAVAILABLE
                
            try:
                opt_site = OptimizerCandidateSite(
                    site_id=db_site.id,
                    name=db_site.name,
                    latitude=db_site.latitude,
                    longitude=db_site.longitude,
                    total_capacity=db_site.capacity_people or 0,
                    available_capacity=db_site.available_capacity or 0,
                    safety_score=db_site.overall_safety_score,
                    accessibility_score=db_site.accessibility_score,
                    infrastructure_score=db_site.infrastructure_score,
                    healthcare_score=db_site.healthcare_score,
                    community_score=db_site.community_score,
                    hazard_exposure=exposures_dict.get(db_site.id, 0.0),
                    status=status_enum
                )
                opt_sites.append(opt_site)
            except ValidationError as e:
                logger.warning(
                    f"Candidate site {db_site.id} fails Optimizer contract and will be excluded. Error: {e}"
                )
                # Skip invalid sites rather than bringing down the whole optimizer
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
