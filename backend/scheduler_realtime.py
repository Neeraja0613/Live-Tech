import sys
import os
import time
import logging
from datetime import datetime

# ── Path setup: allow importing from the ai-bulletin directory ──────────────
AI_BULLETIN_PATH = os.path.join(os.path.dirname(__file__), '..', 'ai-bulletin')
if AI_BULLETIN_PATH not in sys.path:
    sys.path.insert(0, os.path.abspath(AI_BULLETIN_PATH))

from pipeline import run_fetch_and_save   # fetch from Product Hunt + save to Supabase

# ── Configure Logging ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [LIVE TECH] - %(levelname)s - %(message)s'
)

# ── Config ──────────────────────────────────────────────────────────────────
POLL_INTERVAL_SECONDS = 300   # 5 minutes between cycles
RETRY_INTERVAL_SECONDS = 60   # wait 60 s after an error before retrying


def run_realtime_scheduler():
    logging.info("🚀 LIVE TECH Real-time Scheduler Started")
    logging.info(f"📡 Polling Product Hunt every {POLL_INTERVAL_SECONDS // 60} minutes...")

    while True:
        try:
            start_time = datetime.now()
            logging.info(f"🔄 Discovery Cycle started at {start_time.strftime('%H:%M:%S')}")

            # ── 1. Fetch AI tools from Product Hunt & save to Supabase ──────
            logging.info("🔎 Fetching latest AI tools from Product Hunt...")
            tools = run_fetch_and_save()

            # ── 2. Push to Kafka in addition to Supabase ──
            from producer import run_producer   # your Kafka producer helper
            if tools:
                run_producer(tools)
                logging.info(f"✅ Pushed {len(tools)} tools to Kafka")
            else:
                logging.info("ℹ️  No new tools found in this cycle.")

            cycle_duration = (datetime.now() - start_time).total_seconds()
            logging.info(
                f"✨ Cycle complete in {cycle_duration:.2f}s — "
                f"sleeping {POLL_INTERVAL_SECONDS // 60} min..."
            )
            time.sleep(POLL_INTERVAL_SECONDS)

        except KeyboardInterrupt:
            logging.info("🛑 Scheduler stopped by user.")
            break
        except Exception as e:
            logging.error(f"❌ Error in discovery cycle: {e}", exc_info=True)
            logging.info(f"🔄 Retrying in {RETRY_INTERVAL_SECONDS}s...")
            time.sleep(RETRY_INTERVAL_SECONDS)


if __name__ == "__main__":
    run_realtime_scheduler()

