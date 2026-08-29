from fastapi import APIRouter
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary():
    service = DashboardService()
    return service.get_summary()
