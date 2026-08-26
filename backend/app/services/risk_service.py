from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException
from app.ml.baseline import BaselineRiskModel
from app.models.habitation import Habitation
from app.models.risk_assessment import RiskAssessment
from app.models.enums import RiskLevel
from app.schemas.intelligence import RiskFeatures, RiskAssessmentResponse

class RiskService:
    def __init__(self, db: Session):
        self.db = db
        self.model = BaselineRiskModel()
        
    def create_assessment(self, habitation_id: UUID, features: RiskFeatures) -> RiskAssessmentResponse:
        habitation = self.db.query(Habitation).filter(Habitation.id == habitation_id).first()
        if not habitation:
            raise HTTPException(status_code=404, detail="Habitation not found")
            
        # Call the ML Interface
        result = self.model.predict(features)
        
        # Save to DB (1:N appends)
        db_risk = RiskAssessment(
            habitation_id=habitation_id,
            overall_score=result.overall_score,
            risk_level=RiskLevel[result.risk_level],
            hazard_type=habitation.primary_hazard,
            hazard_exposure=features.hazard_exposure,
            terrain_factor=features.terrain_factor,
            population_vulnerability=features.population_vulnerability,
            infrastructure_vulnerability=features.infrastructure_vulnerability,
            accessibility_factor=features.accessibility_factor,
            historical_exposure=features.historical_exposure,
            confidence_score=result.confidence_score,
            primary_driver=result.primary_driver,
            assessment_timestamp=datetime.now(timezone.utc)
        )
        self.db.add(db_risk)
        
        # Update Habitation's cached risk status
        habitation.risk_score = result.overall_score
        habitation.risk_level = RiskLevel[result.risk_level]
        
        self.db.commit()
        
        return RiskAssessmentResponse(
            habitation_id=habitation_id,
            overall_score=result.overall_score,
            risk_level=result.risk_level,
            primary_driver=result.primary_driver,
            confidence_score=result.confidence_score,
            explanation=result.explanation
        )
