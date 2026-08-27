import time
import sys
import os
import uuid
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.services.relocation_service import RelocationService
from app.optimization.engine import ScoringConfig

def run_benchmark():
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        from app.models.habitation import Habitation
        hab = db.query(Habitation).filter(Habitation.name == "Village A").first()
        if not hab:
            print("Village A not found in DB. Run seed_demo.py first.")
            return

        service = RelocationService(db)

        # Baseline Benchmark
        service.engine.config.optimization_mode = "baseline"
        start_time = time.perf_counter()
        for _ in range(100):
            service.recommend_relocation(hab.id)
        baseline_time = time.perf_counter() - start_time

        # OR-Tools Benchmark
        service.engine.config.optimization_mode = "ortools"
        start_time = time.perf_counter()
        for _ in range(100):
            service.recommend_relocation(hab.id)
        ortools_time = time.perf_counter() - start_time

        print(f"--- Benchmark Results (100 iterations) ---")
        print(f"Baseline Engine Time: {baseline_time:.4f}s")
        print(f"OR-Tools Engine Time: {ortools_time:.4f}s")
        print(f"OR-Tools overhead: {(ortools_time/baseline_time - 1) * 100:.2f}%")
        
        res = service.recommend_relocation(hab.id)
        print("\n--- Demo Dataset OR-Tools Result ---")
        print(f"Status: {res.status.value}")
        print(f"Coverage: {res.coverage_percentage}%")
        for alloc in res.allocations:
            print(f"Allocated {alloc.population} to site {alloc.site_id}")

    finally:
        db.close()

if __name__ == "__main__":
    run_benchmark()
