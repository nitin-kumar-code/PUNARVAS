from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.risk_assessment import RiskAssessment
from app.schemas.risk import RiskAssessment as RiskAssessmentSchema
from app.schemas.intelligence import RiskAssessmentRequest, RiskAssessmentResponse
from app.services.risk_service import RiskService
from app.services.habitation_service import HabitationService

router = APIRouter()

# --- DB-dependent routes (RiskService, RelocationService, DecisionService use ORM) ---

@router.get("/risks/{id}", response_model=RiskAssessmentSchema)
def read_risk_assessment(id: UUID, db: Session = Depends(get_db)):
    db_risk = db.query(RiskAssessment).filter(RiskAssessment.id == id).first()
    if db_risk is None:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    return db_risk

@router.post("/risk-assessments", response_model=RiskAssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_risk_assessment(request: RiskAssessmentRequest, db: Session = Depends(get_db)):
    service = RiskService(db)
    return service.create_assessment(request.habitation_id, request.features)

# --- JSON-backed routes (HabitationService reads from JSON, no DB needed) ---

@router.get("/risk-zones")
def get_risk_zones():
    service = HabitationService()
    return service.get_risk_zones()

@router.get("/risk-zones/{id}")
def get_risk_zone_detail(id: UUID):
    service = HabitationService()
    zones = service.get_risk_zones()
    zone = next((z for z in zones if z["id"] == str(id)), None)
    if not zone:
        raise HTTPException(status_code=404, detail="Risk zone not found")
    return zone

@router.get("/relocation/candidates")
def get_relocation_candidates():
    service = HabitationService()
    return service.get_relocation_candidates()

# --- DB-dependent routes (continued) ---

from app.schemas.intelligence import RelocationRecommendationRequest
from app.optimization.schemas import OptimizerOutput
from app.services.relocation_service import RelocationService

@router.post("/relocation/recommend", response_model=OptimizerOutput)
def recommend_relocation(request: RelocationRecommendationRequest, db: Session = Depends(get_db)):
    service = RelocationService(db)
    return service.recommend_relocation(request.habitation_id)

from app.schemas.intelligence import DecisionGenerateRequest
from app.services.decision_service import DecisionService
from app.schemas.decision import DecisionReceipt as DecisionReceiptSchema

@router.post("/decisions/generate", response_model=DecisionReceiptSchema)
def generate_decision(request: DecisionGenerateRequest, db: Session = Depends(get_db)):
    service = DecisionService(db)
    return service.generate_decision(request.habitation_id)
