from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.candidate_site import CandidateSite
from app.schemas.site import CandidateSite as CandidateSiteSchema, CandidateSiteCreate, CandidateSiteUpdate
from app.models.site_assessment import SiteAssessment
from app.schemas.site_assessment import SiteAssessment as SiteAssessmentSchema, SiteAssessmentCreate

router = APIRouter()

@router.get("/", response_model=List[CandidateSiteSchema])
def read_sites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(CandidateSite).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=CandidateSiteSchema)
def read_site(id: UUID, db: Session = Depends(get_db)):
    db_site = db.query(CandidateSite).filter(CandidateSite.id == id).first()
    if db_site is None:
        raise HTTPException(status_code=404, detail="Candidate site not found")
    return db_site

@router.post("/", response_model=CandidateSiteSchema, status_code=status.HTTP_201_CREATED)
def create_site(site: CandidateSiteCreate, db: Session = Depends(get_db)):
    if site.available_capacity > site.capacity_people:
        raise HTTPException(status_code=400, detail="Available capacity cannot exceed total capacity")
    db_site = CandidateSite(**site.model_dump())
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site

@router.put("/{id}", response_model=CandidateSiteSchema)
def update_site(id: UUID, site: CandidateSiteUpdate, db: Session = Depends(get_db)):
    db_site = db.query(CandidateSite).filter(CandidateSite.id == id).first()
    if db_site is None:
        raise HTTPException(status_code=404, detail="Candidate site not found")
    
    update_data = site.model_dump(exclude_unset=True)
    if "available_capacity" in update_data or "capacity_people" in update_data:
        avail = update_data.get("available_capacity", db_site.available_capacity)
        cap = update_data.get("capacity_people", db_site.capacity_people)
        if avail > cap:
             raise HTTPException(status_code=400, detail="Available capacity cannot exceed total capacity")

    for key, value in update_data.items():
        setattr(db_site, key, value)
    
    db.commit()
    db.refresh(db_site)
    return db_site

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(id: UUID, db: Session = Depends(get_db)):
    db_site = db.query(CandidateSite).filter(CandidateSite.id == id).first()
    if db_site is None:
        raise HTTPException(status_code=404, detail="Candidate site not found")
    db.delete(db_site)
    db.commit()
    return None

@router.get("/{id}/assessment", response_model=SiteAssessmentSchema)
def read_site_assessment(id: UUID, db: Session = Depends(get_db)):
    db_assessment = db.query(SiteAssessment).filter(SiteAssessment.site_id == id).order_by(SiteAssessment.assessed_at.desc()).first()
    if db_assessment is None:
        raise HTTPException(status_code=404, detail="Site assessment not found")
    return db_assessment

@router.post("/{id}/assessment", response_model=SiteAssessmentSchema, status_code=status.HTTP_201_CREATED)
def create_site_assessment(id: UUID, assessment: SiteAssessmentCreate, db: Session = Depends(get_db)):
    db_site = db.query(CandidateSite).filter(CandidateSite.id == id).first()
    if db_site is None:
        raise HTTPException(status_code=404, detail="Candidate site not found")
        
    db_assessment = SiteAssessment(**assessment.model_dump(), site_id=id)
    db.add(db_assessment)
    db_site.overall_safety_score = assessment.overall_score
    db.commit()
    db.refresh(db_assessment)
    return db_assessment
