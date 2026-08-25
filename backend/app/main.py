from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import dashboard, habitations, risk, sites, relocation, decisions

app = FastAPI(
    title="PUNARVAS API",
    description="Proactive Relocation Intelligence System Backend API",
    version="0.1.0"
)

# CORS configuration
if settings.FRONTEND_URL:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/")
def read_root():
    return {
        "project": "PUNARVAS",
        "status": "operational",
        "version": "0.1.0"
    }

@app.get(f"{settings.API_V1_PREFIX}/health")
def health_check():
    return {
        "status": "healthy",
        "service": "punarvas-backend",
        "version": "0.1.0"
    }

# Include routers
app.include_router(dashboard.router, prefix=f"{settings.API_V1_PREFIX}/dashboard", tags=["dashboard"])
app.include_router(habitations.router, prefix=f"{settings.API_V1_PREFIX}/habitations", tags=["habitations"])
app.include_router(risk.router, prefix=f"{settings.API_V1_PREFIX}/risk", tags=["risk"])
app.include_router(sites.router, prefix=f"{settings.API_V1_PREFIX}/sites", tags=["sites"])
app.include_router(relocation.router, prefix=f"{settings.API_V1_PREFIX}/relocation", tags=["relocation"])
app.include_router(decisions.router, prefix=f"{settings.API_V1_PREFIX}/decisions", tags=["decisions"])
