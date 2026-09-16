import sys
from pathlib import Path
import logging
import uuid
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Setup path so we can import from ai-ml safely
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
AI_ML_DIR = PROJECT_ROOT / "ai-ml"

if str(AI_ML_DIR) not in sys.path:
    sys.path.append(str(AI_ML_DIR))

try:
    from src.dynamic_risk import calculate_dynamic_risk_single
    from src.live_data import LiveDataProvider
    from src.data_loader import load_habitations
except ImportError as e:
    logger.error(f"Failed to import ML modules: {e}")
    raise e

class MLPredictionService:
    def __init__(self):
        self.provider = None
        self.habitations_df = None
        self._batch_cache = None

    def initialize(self):
        if self.provider is not None:
            return
            
        data_dir = AI_ML_DIR / "data"
        self.provider = LiveDataProvider(str(data_dir))
        
        # Load habitation data for batch inference
        try:
            self.habitations_df = pd.read_csv(data_dir / "habitations.csv").set_index("habitation_id")
        except Exception as e:
            logger.error(f"Failed to load habitations for ML service: {e}")
            self.habitations_df = pd.DataFrame()

    def get_habitation_prediction(self, habitation_id: str, simulate: bool = False, sim_data: dict = None):
        self.initialize()
        
        try:
            h_id = int(habitation_id)
        except ValueError:
            h_id = habitation_id
            
        if h_id not in self.habitations_df.index:
            raise ValueError(f"Habitation {habitation_id} not found in ML dataset")
            
        hab_record = self.habitations_df.loc[h_id]
        lat = hab_record.get("latitude")
        lng = hab_record.get("longitude")
        
        telemetry = {}
        if simulate and sim_data:
            telemetry = sim_data
        else:
            telemetry_obj = self.provider.fetch_latest_observation(lat, lng)
            telemetry = telemetry_obj.to_dict()
            
        prediction = calculate_dynamic_risk_single(hab_record, current_weather=telemetry, current_river=telemetry)
        return prediction

    def get_all_predictions(self):
        self.initialize()
        
        # Cache to avoid expensive re-inference on every API call
        if self._batch_cache is not None:
            return self._batch_cache
            
        from src.predict import _enrich_habitations_with_features
        from src.risk_engine import score_habitations
        import uuid
        
        HABITATION_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
        
        data_dir = str(AI_ML_DIR / "data")
        
        # Step 1: Enrich habitations with terrain, soil, satellite, weather, river data
        # This fixes the training/inference feature mismatch that caused all-CRITICAL
        enriched_df = _enrich_habitations_with_features(self.habitations_df, data_dir)
        
        # Step 2: Use the full risk engine which combines:
        #   - ML hazard predictions (45% weight)
        #   - Exposure scoring: population, density, children (30% weight)
        #   - Vulnerability scoring: housing, healthcare (25% weight)
        # This produces a composite 0-100 risk score with proper triage levels
        scored_df = score_habitations(enriched_df, mode="HYBRID")
        
        records = []
        for idx, row in scored_df.iterrows():
            hab_id = str(idx)
            deterministic_id = uuid.uuid5(HABITATION_NAMESPACE, hab_id)
            
            flood_prob = float(row.get("flood_probability", 0))
            landslide_prob = float(row.get("landslide_probability", 0))
            risk_score = float(row.get("risk_score", 0))
            triage_level = str(row.get("triage_level", "Low"))
            hazard_comp = float(row.get("hazard_component", 0))
            exposure_comp = float(row.get("exposure_component", 0))
            vuln_comp = float(row.get("vulnerability_component", 0))
            confidence = float(row.get("confidence_score", 0))
            explanation = str(row.get("explanation", ""))
            
            # Additional frontend explainability fields
            telemetry_state = str(row.get("telemetry_state", "MISSING"))
            p_any = float(row.get("p_any", 0.0))
            
            # Determine base static hazard. Since we don't have it directly in the 
            # dataframe, we know if telemetry is missing, hazard_comp == static_hazard.
            # If we need it exact, we can recalculate it here, but it's cleaner to 
            # just rely on the API payload extending as needed.
            # Let's extract static hazard logic if possible.
            # (risk_engine.py didn't export it, but we can do a quick check)
            
            # VULNERABILITY DEMOGRAPHICS NOTE:
            # The vulnerable_population metric is currently a planning estimate,
            # NOT a measured demographic census value. It assumes a fixed 30% ratio
            # of total population until measured data is integrated.
            ESTIMATED_VULNERABLE_POP_RATIO = 0.3
            
            # The updated_at field reflects the actual inference or cache initialization timestamp
            current_timestamp = datetime.now(timezone.utc).isoformat()
            
            rec = {
                "id": deterministic_id,
                "habitation_id": hab_id,
                "village_name": str(row.get("village_name", "Unknown")),
                "latitude": float(row.get("latitude", 0)),
                "longitude": float(row.get("longitude", 0)),
                "population": int(row.get("population", 0)),
                "sub_district": str(row.get("sub_district", "Unknown")),
                "triage_level": triage_level,
                "risk_score": round(risk_score, 2),
                "confidence_score": round(confidence, 1),
                "explanation": explanation,
                "updated_at": current_timestamp,
                "hazard_component": round(hazard_comp, 2),
                "exposure_component": round(exposure_comp, 2),
                "vulnerability_component": round(vuln_comp, 2),
                "flood_probability": flood_prob,
                "landslide_probability": landslide_prob,
                "combined_dynamic_probability": p_any,
                "telemetry_state": telemetry_state,
                "vulnerable_population": int(row.get("population", 0) * ESTIMATED_VULNERABLE_POP_RATIO),
                "hazards": {
                    "Flood": float(round(flood_prob * 100, 2)),
                    "Landslide": float(round(landslide_prob * 100, 2))
                },
                "risk_at_last_plan": float(row.get("risk_at_last_plan", risk_score)),
            }
            records.append(rec)
            
        self._batch_cache = records
        return records

    def update_cache_with_dataframe(self, scored_df):
        """Update the API cache directly from a scored dataframe (used by scheduler)."""
        import uuid
        HABITATION_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
        records = []
        for idx, row in scored_df.iterrows():
            hab_id = str(idx)
            deterministic_id = uuid.uuid5(HABITATION_NAMESPACE, hab_id)
            flood_prob = float(row.get("flood_probability", 0))
            landslide_prob = float(row.get("landslide_probability", 0))
            p_any = float(row.get("p_any", 0.0))
            
            ESTIMATED_VULNERABLE_POP_RATIO = 0.3
            current_timestamp = datetime.now(timezone.utc).isoformat()
            
            rec = {
                "id": deterministic_id,
                "habitation_id": hab_id,
                "village_name": str(row.get("village_name", "Unknown")),
                "latitude": float(row.get("latitude", 0)),
                "longitude": float(row.get("longitude", 0)),
                "population": int(row.get("population", 0)),
                "sub_district": str(row.get("sub_district", "Unknown")),
                "triage_level": str(row.get("triage_level", "Low")),
                "risk_score": round(float(row.get("risk_score", 0)), 2),
                "confidence_score": round(float(row.get("confidence_score", 0)), 1),
                "explanation": str(row.get("explanation", "")),
                "updated_at": current_timestamp,
                "hazard_component": round(float(row.get("hazard_component", 0)), 2),
                "exposure_component": round(float(row.get("exposure_component", 0)), 2),
                "vulnerability_component": round(float(row.get("vulnerability_component", 0)), 2),
                "flood_probability": flood_prob,
                "landslide_probability": landslide_prob,
                "combined_dynamic_probability": p_any,
                "telemetry_state": str(row.get("telemetry_state", "MISSING")),
                "vulnerable_population": int(row.get("population", 0) * ESTIMATED_VULNERABLE_POP_RATIO),
                "hazards": {
                    "Flood": float(round(flood_prob * 100, 2)),
                    "Landslide": float(round(landslide_prob * 100, 2))
                },
                "risk_at_last_plan": float(row.get("risk_at_last_plan", float(row.get("risk_score", 0)))),
            }
            records.append(rec)
        self._batch_cache = records
        return records

ml_prediction_service = MLPredictionService()
