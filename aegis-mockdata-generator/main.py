import random
import datetime
import uuid
import json
import requests

# --- Data Generation Constants ---
IMMEDIATE_FLAG_TYPES = [
    "SUICIDE", "GORE", "DRUGS", "SELF_HARM_IDEATION", "CHILD_ABUSE", "VIOLENCE", 
    "ILLEGAL_ACTIVITY", "EXTREMISM", "SELF_INJURY", "DANGEROUS_CHALLENGE"
]
INTERMEDIATE_FLAG_TYPES = [
    "NSFW", "SMUT", "HURTFUL_LANGUAGE_PATTERN", "RACIAL_INSULTS", 
    "CYBERBULLYING", "MISINFORMATION", "SPAM", "HARASSMENT", 
    "INAPPROPRIATE_CONTENT", "HATEFUL_CONDUCT"
]
TOPIC_CATEGORIES = [
    "Mental Health & Well-being", "Social Dynamics", "Financial Behavior", 
    "Community Engagement", "Online Safety", "Content Moderation", 
    "User Communication", "Political Discourse", "General Misinformation", 
    "Online Gaming", "E-commerce", "Health & Wellness", "Educational Content", 
    "Public Figures"
]
SOURCE_PLATFORMS = [
    "Chrome Extension", "Mobile App", "Web Interface", "Email Scan", 
    "Social Media API", "Internal Monitoring System", "Public Forum Scrape", 
    "User Feedback Form", "In-app Messenger", "Email Client", "Online Forum", 
    "Livestreaming Service", "Gaming Console"
]
CONTEXTS = [
    "sustained pattern of negative sentiment", "unusual transactional behavior", 
    "high volume of sent messages", "multiple searches and browsing activity", 
    "private forum discussions", "public chat room interactions", 
    "direct messaging activity", "unusual file upload pattern", 
    "suspicious login attempts", "frequent use of specific keywords", 
    "peer-to-peer messaging", "public comment thread", "user profile bio", 
    "live chat log", "moderated community", "search history"
]
CORROBORATING_SIGNALS = [
    "incognito session usage", "low messaging volume", "unusual time of activity", 
    "login from new device", "sudden change in user behavior", "VPN usage detected", 
    "no corroborating signals", "multiple failed authentication attempts", 
    "unusual geographic location", "rapid message deletion", "account age", 
    "bot-like activity", "high churn rate", "keyword frequency", "location mismatch"
]

def generate_random_record(record_date, user_id):
    """Generates a single randomized JSON record with a fixed user ID."""
    random_time = datetime.time(
        random.randint(0, 23), random.randint(0, 59), random.randint(0, 59)
    )
    timestamp_utc = datetime.datetime.combine(record_date, random_time, tzinfo=datetime.timezone.utc)
    
    signal_type = random.choice(["IMMEDIATE_FLAG", "INTERMEDIATE_FLAG"])
    if signal_type == "IMMEDIATE_FLAG":
        flag_type = random.choice(IMMEDIATE_FLAG_TYPES)
    else:
        flag_type = random.choice(INTERMEDIATE_FLAG_TYPES)
    
    record = {
        "user_id": user_id,
        "timestamp": timestamp_utc.isoformat(),
        "signal_type": signal_type,
        "flag_type": flag_type,
        "confidence": round(random.uniform(0.6, 0.99), 2),
        "topic_category": random.choice(TOPIC_CATEGORIES),
        "source_platform": random.choice(SOURCE_PLATFORMS),
        "event_details": {
            "context": random.choice(CONTEXTS),
            "corroborating_signals": random.sample(CORROBORATING_SIGNALS, random.randint(1, 3))
        }
    }
    return record

def main():
    """Generates data for the last 30 days and sends it via an HTTP request."""
    ENDPOINT_URL = "[URL HERE]"
    all_rows_to_insert = []
    today = datetime.date.today()
    
    # Generate the two fixed user IDs
    user_ids = [str(uuid.uuid4()) for _ in range(2)]

    for i in range(30):
        current_date = today - datetime.timedelta(days=i)
        num_outputs_per_day = random.randint(0, 1)
        
        for _ in range(num_outputs_per_day):
            # Randomly pick one of the two user IDs
            selected_user_id = random.choice(user_ids)
            record = generate_random_record(current_date, selected_user_id)
            all_rows_to_insert.append(record)

    try:
        print(f"Attempting to send {len(all_rows_to_insert)} records to the endpoint...")
        response = requests.post(ENDPOINT_URL, json=all_rows_to_insert)
        response.raise_for_status()
        
        print("\nRequest successful!")
        print("--- Response ---")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print("\nAn error occurred while making the HTTP request.")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()