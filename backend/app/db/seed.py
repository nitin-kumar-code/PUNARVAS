import uuid
from app.core.database import SessionLocal, engine
from app.models import (
    Base, Habitation, RiskAssessment, CandidateSite, SiteAssessment,
    RelocationPlan, Allocation, DecisionReceipt, RiskLevel, PriorityLevel,
    EvacuationStatus, SiteStatus, Recommendation, RelocationStatus
)

def seed_db():
    print("Starting database seeding...")
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(Habitation).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    # Create Habitations
    print("Creating habitations...")
    habitations_data = [
        {"name": "Village A", "state": "Assam", "district": "Majuli", "block": "Majuli", "latitude": 26.95, "longitude": 94.16, "total_population": 450, "vulnerable_population": 120, "households": 95, "primary_hazard": "Flood", "risk_score": 98.5, "priority_level": PriorityLevel.P1, "evacuation_status": EvacuationStatus.ROUTING},
        {"name": "Sector 4", "state": "Kerala", "district": "Wayanad", "block": "Vythiri", "latitude": 11.55, "longitude": 76.08, "total_population": 1200, "vulnerable_population": 300, "households": 250, "primary_hazard": "Landslide", "risk_score": 85.0, "priority_level": PriorityLevel.P1, "evacuation_status": EvacuationStatus.PENDING},
        {"name": "Hillside B", "state": "Uttarakhand", "district": "Chamoli", "block": "Joshimath", "latitude": 30.55, "longitude": 79.56, "total_population": 800, "vulnerable_population": 250, "households": 180, "primary_hazard": "Earthquake", "risk_score": 92.0, "priority_level": PriorityLevel.P1, "evacuation_status": EvacuationStatus.PENDING},
        {"name": "Valley Outpost", "state": "Himachal Pradesh", "district": "Kullu", "block": "Manali", "latitude": 32.23, "longitude": 77.18, "total_population": 350, "vulnerable_population": 100, "households": 70, "primary_hazard": "Flash Flood", "risk_score": 75.0, "priority_level": PriorityLevel.P2, "evacuation_status": EvacuationStatus.PENDING},
        {"name": "Coastal Village M", "state": "Odisha", "district": "Puri", "block": "Puri", "latitude": 19.81, "longitude": 85.83, "total_population": 1500, "vulnerable_population": 400, "households": 320, "primary_hazard": "Cyclone", "risk_score": 88.0, "priority_level": PriorityLevel.P2, "evacuation_status": EvacuationStatus.PENDING},
        {"name": "Riverbend Settlement", "state": "Bihar", "district": "Patna", "block": "Danapur", "latitude": 25.61, "longitude": 85.14, "total_population": 2200, "vulnerable_population": 600, "households": 450, "primary_hazard": "Flood", "risk_score": 65.0, "priority_level": PriorityLevel.P3, "evacuation_status": EvacuationStatus.PENDING},
        {"name": "Mountain Hamlet", "state": "Sikkim", "district": "North Sikkim", "block": "Chungthang", "latitude": 27.60, "longitude": 88.64, "total_population": 180, "vulnerable_population": 50, "households": 40, "primary_hazard": "Landslide", "risk_score": 95.0, "priority_level": PriorityLevel.P1, "evacuation_status": EvacuationStatus.ROUTING},
        {"name": "Forest Edge", "state": "Madhya Pradesh", "district": "Mandla", "block": "Mandla", "latitude": 22.59, "longitude": 80.37, "total_population": 600, "vulnerable_population": 150, "households": 120, "primary_hazard": "Forest Fire", "risk_score": 45.0, "priority_level": PriorityLevel.P3, "evacuation_status": EvacuationStatus.PENDING},
        {"name": "Plains Town", "state": "Uttar Pradesh", "district": "Gorakhpur", "block": "Gorakhpur", "latitude": 26.76, "longitude": 83.37, "total_population": 3500, "vulnerable_population": 800, "households": 700, "primary_hazard": "Flood", "risk_score": 55.0, "priority_level": PriorityLevel.P3, "evacuation_status": EvacuationStatus.PENDING},
        {"name": "Desert Outskirt", "state": "Rajasthan", "district": "Jaisalmer", "block": "Sam", "latitude": 26.91, "longitude": 70.91, "total_population": 400, "vulnerable_population": 80, "households": 85, "primary_hazard": "Drought", "risk_score": 35.0, "priority_level": PriorityLevel.P3, "evacuation_status": EvacuationStatus.PENDING},
    ]

    habitations = []
    for data in habitations_data:
        hab = Habitation(**data)
        db.add(hab)
        habitations.append(hab)
    db.commit()
    
    # Create Risk Assessments
    print("Creating risk assessments...")
    risk_assessments = []
    for hab in habitations:
        level = RiskLevel.CRITICAL if hab.risk_score >= 85 else (RiskLevel.HIGH if hab.risk_score >= 70 else (RiskLevel.MEDIUM if hab.risk_score >= 50 else RiskLevel.LOW))
        assessment = RiskAssessment(
            habitation_id=hab.id,
            overall_score=hab.risk_score,
            risk_level=level,
            hazard_type=hab.primary_hazard,
            hazard_exposure=hab.risk_score,
            terrain_factor=80.0,
            population_vulnerability=70.0,
            infrastructure_vulnerability=60.0,
            accessibility_factor=50.0,
            historical_exposure=40.0,
            confidence_score=90.0,
            primary_driver="Hazard Exposure"
        )
        db.add(assessment)
        risk_assessments.append(assessment)
    db.commit()

    # Create Candidate Sites
    print("Creating candidate sites...")
    sites_data = [
        {"name": "Site A - Safe Ground", "state": "Assam", "district": "Jorhat", "latitude": 26.75, "longitude": 94.20, "capacity_households": 500, "capacity_people": 2500, "available_capacity": 2500, "status": SiteStatus.ACTIVE},
        {"name": "Site B - Hilltop Shelter", "state": "Kerala", "district": "Wayanad", "latitude": 11.60, "longitude": 76.10, "capacity_households": 300, "capacity_people": 1500, "available_capacity": 300, "status": SiteStatus.LIMITED}, # Almost full
        {"name": "Site C - Valley Camp", "state": "Uttarakhand", "district": "Chamoli", "latitude": 30.60, "longitude": 79.50, "capacity_households": 400, "capacity_people": 2000, "available_capacity": 2000, "status": SiteStatus.ACTIVE},
        {"name": "Site D - River Floodplain (Rejected)", "state": "Himachal Pradesh", "district": "Kullu", "latitude": 32.20, "longitude": 77.20, "capacity_households": 200, "capacity_people": 1000, "available_capacity": 1000, "status": SiteStatus.UNSAFE, "flood_risk": 95.0},
        {"name": "Site E - Coastal High Ground", "state": "Odisha", "district": "Khurda", "latitude": 20.18, "longitude": 85.63, "capacity_households": 600, "capacity_people": 3000, "available_capacity": 3000, "status": SiteStatus.ACTIVE},
        {"name": "Site F - Full Facility", "state": "Bihar", "district": "Patna", "latitude": 25.55, "longitude": 85.05, "capacity_households": 250, "capacity_people": 1250, "available_capacity": 0, "status": SiteStatus.FULL},
        {"name": "Site G - Highland Plateau", "state": "Sikkim", "district": "East Sikkim", "latitude": 27.33, "longitude": 88.61, "capacity_households": 150, "capacity_people": 750, "available_capacity": 750, "status": SiteStatus.ACTIVE},
        {"name": "Site H - Secure Base", "state": "Uttar Pradesh", "district": "Gorakhpur", "latitude": 26.80, "longitude": 83.40, "capacity_households": 800, "capacity_people": 4000, "available_capacity": 4000, "status": SiteStatus.ACTIVE},
    ]

    candidate_sites = []
    for data in sites_data:
        site = CandidateSite(**data, water_availability=True, electricity_availability=True, healthcare_access=True, road_accessibility=True, shelter_availability=True)
        db.add(site)
        candidate_sites.append(site)
    db.commit()

    # Create Site Assessments
    print("Creating site assessments...")
    for site in candidate_sites:
        recommendation = Recommendation.SAFE if site.status == SiteStatus.ACTIVE else (Recommendation.UNSAFE if site.status == SiteStatus.UNSAFE else Recommendation.RECOMMENDED)
        rejection_reason = "High flood risk" if site.status == SiteStatus.UNSAFE else None
        overall_safety = 20.0 if site.status == SiteStatus.UNSAFE else 90.0
        
        site.overall_safety_score = overall_safety
        assessment = SiteAssessment(
            site_id=site.id,
            safety_score=overall_safety,
            capacity_score=85.0,
            accessibility_score=90.0,
            infrastructure_score=80.0,
            community_score=75.0,
            overall_score=overall_safety,
            recommendation=recommendation,
            rejection_reason=rejection_reason
        )
        db.add(assessment)
    db.commit()

    # Create Relocation Plans, Allocations, Decision Receipts
    print("Creating relocation plans and allocations...")
    # Plan 1: Village A to Site A
    plan1 = RelocationPlan(
        source_habitation_id=habitations[0].id,
        total_population=habitations[0].total_population,
        vulnerable_population=habitations[0].vulnerable_population,
        status=RelocationStatus.APPROVED,
        total_travel_time=45.0,
        coverage_percentage=100.0
    )
    db.add(plan1)
    db.commit()

    alloc1 = Allocation(
        relocation_plan_id=plan1.id,
        candidate_site_id=candidate_sites[0].id,
        population_allocated=habitations[0].total_population,
        vulnerable_population_allocated=habitations[0].vulnerable_population,
        travel_time_minutes=45.0,
        allocation_percentage=100.0
    )
    db.add(alloc1)
    # Update capacity
    candidate_sites[0].available_capacity -= habitations[0].total_population

    receipt1 = DecisionReceipt(
        relocation_plan_id=plan1.id,
        decision_type="FULL_RELOCATION",
        decision_summary="Village A relocated to Site A due to imminent flood risk.",
        risk_score=98.5,
        primary_reason="Flood hazard exceeding threshold",
        evidence={"hazard_model": "flood_v2", "confidence": 0.95},
        confidence_score=95.0
    )
    db.add(receipt1)

    # Plan 2: Sector 4 split between Site B and Site C
    plan2 = RelocationPlan(
        source_habitation_id=habitations[1].id,
        total_population=1000, # Only relocating 1000 out of 1200
        vulnerable_population=300,
        status=RelocationStatus.READY_FOR_REVIEW,
        total_travel_time=90.0,
        coverage_percentage=83.3
    )
    db.add(plan2)
    db.commit()

    alloc2a = Allocation(
        relocation_plan_id=plan2.id,
        candidate_site_id=candidate_sites[1].id, # Site B
        population_allocated=300,
        vulnerable_population_allocated=100,
        travel_time_minutes=30.0,
        allocation_percentage=30.0
    )
    alloc2b = Allocation(
        relocation_plan_id=plan2.id,
        candidate_site_id=candidate_sites[2].id, # Site C
        population_allocated=700,
        vulnerable_population_allocated=200,
        travel_time_minutes=60.0,
        allocation_percentage=70.0
    )
    db.add(alloc2a)
    db.add(alloc2b)
    candidate_sites[1].available_capacity -= 300
    candidate_sites[2].available_capacity -= 700

    receipt2 = DecisionReceipt(
        relocation_plan_id=plan2.id,
        decision_type="SPLIT_RELOCATION",
        decision_summary="Sector 4 partially relocated to Sites B and C.",
        risk_score=85.0,
        primary_reason="Landslide risk requiring partial evacuation",
        evidence={"hazard_model": "landslide_v1", "capacity_constraint": "Site B limited"},
        confidence_score=88.0
    )
    db.add(receipt2)

    db.commit()
    print("Database seeded successfully.")
    db.close()

if __name__ == "__main__":
    seed_db()
