from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.candidate_site import CandidateSite
from app.schemas.site import CandidateSite as CandidateSiteSchema, CandidateSiteCreate, CandidateSiteUpdate
from app.models.site_assessment import SiteAssessment
from app.schemas.site_assessment import SiteAssessment as SiteAssessmentSchema, SiteAssessmentCreate
from app.services.site_service import SiteService

router = APIRouter()

@router.get("/", response_model=List[CandidateSiteSchema])
def read_sites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = SiteService()
    return service.get_all_sites(skip=skip, limit=limit)

@router.get("/{id}", response_model=CandidateSiteSchema)
def read_site(id: UUID, db: Session = Depends(get_db)):
    service = SiteService()
    db_site = service.get_site_by_id(id)
    if db_site is None:
        raise HTTPException(status_code=404, detail="Candidate site not found")
    return db_site

@router.post("/", response_model=CandidateSiteSchema, status_code=status.HTTP_201_CREATED)
def create_site(site: CandidateSiteCreate, db: Session = Depends(get_db)):
    raise HTTPException(status_code=403, detail="Write operations disabled - using immutable ML dataset")

@router.put("/{id}", response_model=CandidateSiteSchema)
def update_site(id: UUID, site: CandidateSiteUpdate, db: Session = Depends(get_db)):
    raise HTTPException(status_code=403, detail="Write operations disabled - using immutable ML dataset")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(id: UUID, db: Session = Depends(get_db)):
    raise HTTPException(status_code=403, detail="Write operations disabled - using immutable ML dataset")

@router.get("/{id}/assessment", response_model=SiteAssessmentSchema)
def read_site_assessment(id: UUID, db: Session = Depends(get_db)):
    raise HTTPException(status_code=410, detail="Site assessment legacy table is permanently gone")

@router.post("/{id}/assessment", response_model=SiteAssessmentSchema, status_code=status.HTTP_201_CREATED)
def create_site_assessment(id: UUID, assessment: SiteAssessmentCreate, db: Session = Depends(get_db)):
    raise HTTPException(status_code=403, detail="Write operations disabled - using immutable ML dataset")
