import sys
import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import Base
from app.core.config import settings
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.models.hazard import Hazard
from app.models.site_hazard_exposure import SiteHazardExposure
from app.models.enums import RiskLevel, SiteStatus

def seed_demo_data():
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Habitation: Village A
        hab_a = Habitation(
            id=uuid.uuid4(),
            name="Village A",
            state="Demo State",
            district="Demo District",
            block="Demo Block",
            latitude=20.0,
            longitude=80.0,
            total_population=1840,
            vulnerable_population=312,
            households=400,
            primary_hazard="FLOOD",
            risk_score=91.0,
            risk_level=RiskLevel.CRITICAL
        )
        db.add(hab_a)

        # Site B: Active, Safe, 1000 capacity
        site_b = CandidateSite(
            id=uuid.uuid4(),
            name="Site B",
            state="Demo State",
            district="Demo District",
            latitude=20.1,
            longitude=80.1,
            capacity_people=1000,
            available_capacity=1000,
            overall_safety_score=95.0,
            status=SiteStatus.ACTIVE
        )
        db.add(site_b)

        # Site D: Active, Safe, 840 capacity
        site_d = CandidateSite(
            id=uuid.uuid4(),
            name="Site D",
            state="Demo State",
            district="Demo District",
            latitude=20.2,
            longitude=80.2,
            capacity_people=840,
            available_capacity=840,
            overall_safety_score=90.0,
            status=SiteStatus.ACTIVE
        )
        db.add(site_d)

        # Site C: Unsafe, 1000 capacity
        site_c = CandidateSite(
            id=uuid.uuid4(),
            name="Site C",
            state="Demo State",
            district="Demo District",
            latitude=20.3,
            longitude=80.3,
            capacity_people=1000,
            available_capacity=1000,
            overall_safety_score=20.0,
            status=SiteStatus.UNSAFE
        )
        db.add(site_c)

        # Hazard
        hazard_1 = Hazard(
            id=uuid.uuid4(),
            type="FLOOD",
            severity=90.0,
            latitude=20.05,
            longitude=80.05,
            affected_area="Basin"
        )
        db.add(hazard_1)

        db.commit()
        print("Successfully seeded demo data.")
    except Exception as e:
        print(f"Failed to seed demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
