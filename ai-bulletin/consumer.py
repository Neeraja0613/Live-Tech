import json
from kafka import KafkaConsumer
from supabase_client import supabase
from pipeline import calculate_trending_score

def run_consumer():

    consumer = KafkaConsumer(
        "producthunt-ai-tools",
        bootstrap_servers="localhost:9092",
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        auto_offset_reset="earliest",
        consumer_timeout_ms=5000
    )

    for message in consumer:

        tool = message.value
        
        # Calculate trending score
        score = calculate_trending_score(tool["created_at"], tool["topics"], tool.get("votes", 0))

        data = {
            "id": int(tool["id"]),
            "date": tool["date"],
            "name": tool["name"],
            "tagline": tool["tagline"],
            "description": tool["description"],
            "votes": tool["votes"],
            "website": tool["website"],
            "created_at": tool["created_at"],
            "topics": tool["topics"],
            "trending_score": score
        }

        response = supabase.table("ai_tools").upsert(data).execute()

        print(f"[Consumer] Saved: {tool['name']} (Score: {score})")

    consumer.close()
    print("[Consumer] All tools saved to Supabase")