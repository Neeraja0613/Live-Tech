from pipeline import run_fetch_and_save
import time

print("LIVE TECH Realtime Pipeline Started")

while True:
    try:
        run_fetch_and_save()
        print("Waiting 5 minutes...\n")
        time.sleep(300)
    except Exception as e:
        print("Error:", e)
        time.sleep(60)