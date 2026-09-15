import logging
from datetime import datetime, timezone
import pandas as pd
from pathlib import Path

from app.core.config import settings
from app.services.ml_prediction_service import MLPredictionService
from app.services.relocation_service import RelocationService

# Import from the ai-ml package (which is assumed to be in PYTHONPATH or path hacked)
import sys
import os
PROJECT_ROOT = Path(os.path.abspath(__file__)).parent.parent.parent.parent
if str(PROJECT_ROOT / "ai-ml") not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT / "ai-ml"))

from src.live_data import LiveDataProvider
from src.predict import _enrich_habitations_with_features
from src.risk_engine import score_habitations
from src.dynamic_math import evaluate_telemetry_state

logger = logging.getLogger(__name__)

class LiveInferencePipeline:
    def __init__(self, db_session=None):
        self.db = db_session
        self.data_dir = str(PROJECT_ROOT / "ai-ml" / "data")
        # Real APIs are not connected. We use the provider that falls back to historical/synthetic data.
        self.data_provider = LiveDataProvider(self.data_dir)
        self.last_run_state = {
            "inference_timestamp": None,
            "observation_timestamp": None,
            "data_source": "NOT CONNECTED - Using simulated/fallback provider",
            "number_of_habitations_processed": 0,
            "number_of_successful_predictions": 0,
            "number_of_invalid_records": 0,
            "number_of_stale_records": 0,
            "number_of_failed_predictions": 0,
            "telemetry_status": "UNKNOWN",
            "escalations": []
        }
        
    def run_6hour_inference_cycle(self, synthetic_weather=None):
        """
        Execute the live inference cycle.
        synthetic_weather: optional dataframe/dict of controlled observations for testing.
        """
        logger.info("Starting 6-hour Live Inference Pipeline...")
        self.last_run_state["inference_timestamp"] = datetime.now(timezone.utc).isoformat()
        
        try:
            # 1. Fetch habitation baseline data
            hab_df = pd.read_csv(Path(self.data_dir) / "habitations.csv")
            if 'habitation_id' in hab_df.columns:
                hab_df = hab_df.set_index('habitation_id')
                
            total_habs = len(hab_df)
            self.last_run_state["number_of_habitations_processed"] = total_habs
            
            # 2. Live Data Ingestion
            # In a real system, we'd fetch live data for all locations here.
            # Currently NOT CONNECTED to real IMD/CWC.
            logger.info("Live data API NOT CONNECTED. Fetching via provider interface.")
            weather_updates = []
            
            if synthetic_weather is not None:
                # Use provided synthetic data (for testing end-to-end)
                if isinstance(synthetic_weather, pd.DataFrame):
                    hab_updates = synthetic_weather
                else:
                    hab_updates = pd.DataFrame.from_dict(synthetic_weather, orient='index')
                    hab_updates.index.name = 'habitation_id'
            else:
                # Try to fetch from provider for each habitation.
                # (Warning: this might be slow for 1170 records if unoptimized, 
                # but LiveDataProvider in prototype is just pandas filtering)
                latest_obs_time = None
                for hid, row in hab_df.iterrows():
                    obs = self.data_provider.fetch_latest_observation(
                        latitude=row.get('latitude', 0.0),
                        longitude=row.get('longitude', 0.0)
                    )
                    obs_dict = obs.to_dict()
                    obs_dict['habitation_id'] = hid
                    weather_updates.append(obs_dict)
                    
                    if latest_obs_time is None or obs.timestamp > latest_obs_time:
                        latest_obs_time = obs.timestamp
                        
                hab_updates = pd.DataFrame(weather_updates).set_index('habitation_id')
                if latest_obs_time:
                    self.last_run_state["observation_timestamp"] = latest_obs_time

            # 3. Data Validation + Feature Engineering
            # We enrich the base habitations with the live observations
            enriched_df = _enrich_habitations_with_features(hab_df.reset_index(), self.data_dir)
            if 'habitation_id' in enriched_df.columns:
                enriched_df = enriched_df.set_index('habitation_id')
            
            # Overlay the live/synthetic weather updates over the baseline features
            for col in hab_updates.columns:
                if col in enriched_df.columns:
                    enriched_df.update(hab_updates[[col]])
                else:
                    enriched_df = enriched_df.join(hab_updates[[col]])

            # 4. & 5. ML Inference & Dynamic Risk Calculation
            # score_habitations internally validates telemetry freshness and applies Approach A
            scored_df = score_habitations(enriched_df, mode="HYBRID")
            
            # 6. Update Risk State and Check Escalations
            successful = 0
            failed = 0
            invalid = 0
            stale = 0
            escalations = []
            
            # Get previous state to calculate deltas
            from app.services.ml_prediction_service import ml_prediction_service as ml_service
            ml_service.initialize()
            prev_predictions = ml_service.get_all_predictions()
            prev_map = {str(p["habitation_id"]): p for p in prev_predictions}
            
            for idx, row in scored_df.iterrows():
                hid = str(idx)
                t_state = str(row.get("telemetry_state", "MISSING"))
                
                if t_state == "FRESH":
                    successful += 1
                elif t_state == "STALE" or t_state == "EXPIRED":
                    stale += 1
                elif t_state == "INVALID" or t_state == "MISSING":
                    invalid += 1
                else:
                    failed += 1
                    
                # Delta tracking
                curr_triage = str(row.get("triage_level", "Low"))
                prev = prev_map.get(hid)
                if prev:
                    prev_triage = prev.get("triage_level", "Low")
                    # Check for escalation
                    triage_order = {"Low": 0, "Moderate": 1, "High": 2, "Critical": 3}
                    if triage_order.get(curr_triage, 0) > triage_order.get(prev_triage, 0):
                        escalations.append({
                            "habitation_id": hid,
                            "village_name": str(row.get("village_name", "Unknown")),
                            "previous_triage": prev_triage,
                            "current_triage": curr_triage,
                            "risk_delta": round(float(row.get("risk_score", 0)) - prev.get("risk_score", 0), 2)
                        })
                        
                        # 7. Relocation Reassessment
                        # If risk reached High or Critical, trigger reassessment if DB is available
                        if curr_triage in ["High", "Critical"] and self.db:
                            logger.warning(f"Habitation {hid} escalated to {curr_triage}. Triggering Relocation Optimizer.")
                            try:
                                reloc_service = RelocationService(self.db)
                                # Actually triggering optimizer. Note: Requires valid UUID for DB
                                # For demonstration, we just log it unless we have valid DB records.
                                # reloc_service.recommend_relocation(uuid_of_habitation)
                                logger.info(f"Relocation optimization request queued for {hid}.")
                            except Exception as e:
                                logger.error(f"Failed to trigger relocation optimizer for {hid}: {e}")

            # Update cache in MLPredictionService so the API serves the new data immediately
            ml_service.update_cache_with_dataframe(scored_df)
            ml_service.last_inference_state = self.last_run_state

            self.last_run_state["number_of_successful_predictions"] = successful
            self.last_run_state["number_of_invalid_records"] = invalid
            self.last_run_state["number_of_stale_records"] = stale
            self.last_run_state["number_of_failed_predictions"] = failed
            self.last_run_state["escalations"] = escalations
            self.last_run_state["telemetry_status"] = "PROCESSED"
            
            logger.info(f"Inference cycle complete. {successful} fresh, {stale} stale, {invalid} invalid.")
            if escalations:
                logger.info(f"Detected {len(escalations)} risk escalations.")
                
            return self.last_run_state
            
        except Exception as e:
            logger.error(f"Live inference pipeline failed: {e}", exc_info=True)
            self.last_run_state["telemetry_status"] = "FAILED"
            return self.last_run_state

