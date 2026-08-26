from sqlalchemy.orm import Session
from app.models.candidate_site import CandidateSite

class SiteService:
    def __init__(self, db: Session):
        self.db = db
        
    def get_all_sites(self):
        return self.db.query(CandidateSite).all()
