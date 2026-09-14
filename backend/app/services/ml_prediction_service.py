import sys
from pathlib import Path
import logging

logger = logging.getLogger(__name__)
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
            
        from src.predict import predict_hazards_batch
        import uuid
        
        HABITATION_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
        
        # Run batch prediction
        results_df = predict_hazards_batch(self.habitations_df)
        
        records = []
        for idx, row in results_df.iterrows():
            hab_id = str(idx)
            deterministic_id = uuid.uuid5(HABITATION_NAMESPACE, hab_id)
            
            # Map features to the frontend-expected schema
            flood_prob = float(row.get("flood_probability", 0))
            landslide_prob = float(row.get("landslide_probability", 0))
            overall_risk = row.get("overall_risk", "LOW")
            
            rec = {
                "id": deterministic_id,
                "habitation_id": hab_id,
                "village_name": str(row.get("village_name", "Unknown")),
                "latitude": float(row.get("latitude", 0)),
                "longitude": float(row.get("longitude", 0)),
                "population": int(row.get("population", 0)),
                "sub_district": str(row.get("sub_district", "Unknown")),
                "triage_level": overall_risk,
                "risk_score": float(round(max(flood_prob, landslide_prob) * 100, 2)),
                "confidence_score": 90.0, 
                "explanation": f"ML Derived. Flood Risk: {row.get('flood_risk')}, Landslide Risk: {row.get('landslide_risk')}",
                "updated_at": "2024-10-24T12:00:00Z",
                "hazard_component": float(round(max(flood_prob, landslide_prob) * 100, 2)),
                "exposure_component": 50,
                "vulnerability_component": 50,
                "vulnerable_population": int(row.get("population", 0) * 0.3),
                "hazards": {
                    "Flood": float(round(flood_prob * 100, 2)),
                    "Landslide": float(round(landslide_prob * 100, 2))
                }
            }
            records.append(rec)
            
        self._batch_cache = records
        return records

ml_prediction_service = MLPredictionService()
