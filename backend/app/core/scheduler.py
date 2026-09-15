import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.live_inference_service import LiveInferencePipeline
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def run_inference_job():
    logger.info("Executing scheduled live inference cycle.")
    db = SessionLocal()
    try:
        pipeline = LiveInferencePipeline(db_session=db)
        state = pipeline.run_6hour_inference_cycle()
        logger.info(f"Live inference cycle completed. Status: {state.get('telemetry_status')}")
    except Exception as e:
        logger.error(f"Live inference job failed: {e}", exc_info=True)
    finally:
        db.close()

def start_scheduler():
    # Schedule to run at 00:00, 06:00, 12:00, 18:00
    scheduler.add_job(
        run_inference_job,
        trigger=CronTrigger(hour="0,6,12,18", minute="0"),
        id="live_inference_6h",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Background scheduler started: Live inference configured for 6-hour cycles.")

def shutdown_scheduler():
    scheduler.shutdown()
    logger.info("Background scheduler shut down.")
