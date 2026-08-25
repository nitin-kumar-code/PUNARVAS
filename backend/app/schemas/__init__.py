from app.schemas.habitation import Habitation, HabitationCreate, HabitationUpdate
from app.schemas.risk import RiskAssessment, RiskAssessmentCreate, RiskAssessmentUpdate
from app.schemas.site import CandidateSite, CandidateSiteCreate, CandidateSiteUpdate
from app.schemas.site_assessment import SiteAssessment, SiteAssessmentCreate, SiteAssessmentUpdate
from app.schemas.relocation import RelocationPlan, RelocationPlanCreate, RelocationPlanUpdate
from app.schemas.allocation import Allocation, AllocationCreate, AllocationUpdate
from app.schemas.decision import DecisionReceipt, DecisionReceiptCreate, DecisionReceiptUpdate

__all__ = [
    "Habitation", "HabitationCreate", "HabitationUpdate",
    "RiskAssessment", "RiskAssessmentCreate", "RiskAssessmentUpdate",
    "CandidateSite", "CandidateSiteCreate", "CandidateSiteUpdate",
    "SiteAssessment", "SiteAssessmentCreate", "SiteAssessmentUpdate",
    "RelocationPlan", "RelocationPlanCreate", "RelocationPlanUpdate",
    "Allocation", "AllocationCreate", "AllocationUpdate",
    "DecisionReceipt", "DecisionReceiptCreate", "DecisionReceiptUpdate",
]
