import random
import datetime
import uuid
import json
import requests
import os
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig

# --- Environment and Client Initialization ---
load_dotenv()
# Ensure your GCP_PROJECT_ID is set in your .env file or environment
try:
    vertexai.init(project=os.environ.get("GCP_PROJECT_ID"), location="us-central1")
except Exception as e:
    print(f"Vertex AI initialization failed. Make sure you've authenticated with GCP. Error: {e}")
    exit()

ENDPOINT_URL=os.environ.get("URL")

# --- Data Generation Constants ---
IMMEDIATE_FLAG_TYPES = [
    "SUICIDE", "GORE", "DRUGS", "CHILD_ABUSE", "VIOLENCE",
    "ILLEGAL_ACTIVITY", "EXTREMISM", "SELF_INJURY", "DANGEROUS_CHALLENGE"
]
INTERMEDIATE_FLAG_TYPES = [
    "NSFW", "SMUT", "HURTFUL_LANGUAGE_PATTERN", "RACIAL_INSULTS",
    "CYBERBULLYING", "MISINFORMATION", "SPAM", "HARASSMENT",
    "INAPPROPRIATE_CONTENT", "HATEFUL_CONDUCT"
]
SOURCE_PLATFORM = "Chrome Extension"  # Fixed as per requirement

NEUTRAL_ACTIVITIES = [
    {"context": "Watching educational videos on history", "topic_category": "Educational Content"},
    {"context": "Chatting with friends about a school project", "topic_category": "Social Dynamics"},
    {"context": "Reading an e-book for literature class", "topic_category": "Books & Literature"},
    {"context": "Browsing for a new pair of sneakers", "topic_category": "E-commerce"},
    {"context": "Listening to a curated playlist on Spotify", "topic_category": "Music"},
]

# --- Persona Definitions ---
PERSONAS = [
    {
        "user_id": "Alice",
        "description": "SELF_INJURY Persona",
        "primary_flag_type": "SELF_INJURY",
        "intermediate_noise": ["CYBERBULLYING", "INAPPROPRIATE_CONTENT"] # Related negative behaviors
    },
    {
        "user_id": "Jake",
        "description": "DRUGS Persona",
        "primary_flag_type": "DRUGS",
        "intermediate_noise": ["MISINFORMATION", "SPAM"] # e.g., Spreading misinformation about drug safety, spamming for money
    },
    {
        "user_id": "Ronald",
        "description": "HATEFUL_CONDUCT Persona",
        "primary_flag_type": "HATEFUL_CONDUCT",
        "intermediate_noise": ["RACIAL_INSULTS", "HURTFUL_LANGUAGE_PATTERN"] # Other forms of hate
    }
]

# --- Gemini API Integration ---
def generate_dynamic_details_with_gemini(flag_type: str):
    """
    Uses the Gemini API to generate realistic, story-driven details for a given flag type.
    """
    try:
        model = GenerativeModel("gemini-2.5-flash-lite")

        prompt = f"""
        SYSTEM: You are an objective browser activity logger. You operate like a spy on the computer, reporting only what is visible on the screen.
        Your task is to generate a short, realistic, and factual scenario based on a user's browser activity.
        The details must be plausible for a user in Singapore.

        INSTRUCTION:
        For the given `flag_type`, generate a JSON object containing:
        1. `topic_category`: A relevant and specific category for this activity.
        2. `context`: A short, one-sentence, objective description of the action observed on the screen. **Do not infer the user's age or demographics (e.g., do not use the word 'teenager').** State only the observed facts, such as "A search was made for..." or "The user navigated to...". The story should only include a name (e.g., "Alex", "Priya") if the activity takes place on a platform where a username would be visible (like Facebook Marketplace, a forum, or a social media site).
        3. `corroborating_signals`: An array of 1 to 3 short, specific browser actions (like exact search queries or site visits) that logically support the context.

        FLAG_TYPE: "{flag_type}"

        OUTPUT_FORMAT:
        Provide ONLY the raw JSON content. Do not include any other text, commentary, or markdown formatting.

        Example for "DRUGS" (Named context on a marketplace):
        {{
          "topic_category": "Illicit Substance Acquisition",
          "context": "A user with the profile name 'Alex_SG' has a shopping cart on the 'DIY Depot SG' website containing 15 different types of industrial-strength glue.",
          "corroborating_signals": [
            "Previous search query: 'strongest glue for inhaling'",
            "Visited a forum thread titled 'household item highs'",
            "Viewed 5-star reviews on 'DIY Depot SG' for specific glue products"
          ]
        }}

        Example for "SELF_INJURY" (Anonymous context on a blog):
        {{
            "topic_category": "Mental Health Crisis",
            "context": "The browser is currently on a blog post titled 'My Struggle and How I Cope', which details methods of self-harm.",
            "corroborating_signals": [
                "Search query used to find page: 'ways to hide scars'",
                "Watched a related video titled 'Feeling Empty' on the same page",
                "Bookmarked the blog's main page"
            ]
        }}
        """

        generation_config = GenerationConfig(
            temperature=0.8,
            top_p=0.95,
            response_mime_type="application/json",
        )

        response = model.generate_content(prompt, generation_config=generation_config)
        return json.loads(response.text)

    except Exception as e:
        print(f"Error calling Gemini API for flag '{flag_type}': {e}. Using fallback data.")
        return {
            "topic_category": "Fallback Category",
            "context": "Fallback Context: API Error",
            "corroborating_signals": ["API call failed"]
        }

def generate_random_record(record_date, persona, day_index):
    """Generates a single randomized JSON record based on the persona's dynamic storyline."""
    random_time = datetime.time(
        random.randint(0, 23), random.randint(0, 59), random.randint(0, 59)
    )
    timestamp_utc = datetime.datetime.combine(record_date, random_time, tzinfo=datetime.timezone.utc)

    user_id = persona['user_id']
    signal_type = "NEUTRAL_FLAG"
    flag_type = "NEUTRAL"

    # --- MODIFIED: Dynamic, time-based storyline logic with more neutrality ---
    if user_id == "Alice": # SELF_INJURY Persona
        if day_index >= 10:
            # Max probability of a non-neutral event is 70% on the final day
            downhill_probability = (day_index - 9) / 20.0 * 0.7
            if random.random() < downhill_probability:
                flag_type = random.choices(
                    population=[persona["primary_flag_type"]] + persona["intermediate_noise"],
                    weights=[0.7] + [0.15] * len(persona["intermediate_noise"]), # 70% chance of primary flag
                    k=1
                )[0]

    elif user_id == "Jake": # DRUGS Persona
        if day_index >= 15:
            # Spike to a consistent but reasonable 60% chance of a non-neutral event
            if random.random() < 0.60:
                 flag_type = random.choices(
                    population=[persona["primary_flag_type"]] + persona["intermediate_noise"],
                    weights=[0.8] + [0.1] * len(persona["intermediate_noise"]), # 80% chance of primary flag
                    k=1
                )[0]

    elif user_id == "Ronald": # HATEFUL_CONDUCT Persona
        if day_index >= 8:
            # Max probability of a non-neutral event is 75% on the final day
            influence_probability = (day_index - 7) / 22.0 * 0.75
            if random.random() < influence_probability:
                flag_type = random.choices(
                    population=[persona["primary_flag_type"]] + persona["intermediate_noise"],
                    weights=[0.7] + [0.15] * len(persona["intermediate_noise"]), # 70% chance of primary flag
                    k=1
                )[0]
        else:
            # Lowered the probability of early intermediate noise
            if random.random() < 0.05:
                flag_type = random.choice(persona["intermediate_noise"])

    # Determine signal_type based on the final flag_type
    if flag_type in IMMEDIATE_FLAG_TYPES:
        signal_type = "IMMEDIATE_FLAG"
    elif flag_type in INTERMEDIATE_FLAG_TYPES:
        signal_type = "INTERMEDIATE_FLAG"
    else:
        signal_type = "NEUTRAL_FLAG"


    # --- Generate details based on the determined flag type ---
    if flag_type == "NEUTRAL":
        neutral_activity = random.choice(NEUTRAL_ACTIVITIES)
        topic_category = neutral_activity["topic_category"]
        event_details = {
            "context": neutral_activity["context"],
            "corroborating_signals": ["neutral user activity"]
        }
    else:
        # For any non-neutral flag, call Gemini
        dynamic_details = generate_dynamic_details_with_gemini(flag_type)
        topic_category = dynamic_details.get("topic_category", "Error")
        event_details = {
            "context": dynamic_details.get("context", "Error"),
            "corroborating_signals": dynamic_details.get("corroborating_signals", ["Error"])
        }

    record = {
        "user_id": persona["user_id"],
        "timestamp": timestamp_utc.isoformat(),
        "signal_type": signal_type,
        "flag_type": flag_type,
        "confidence": round(random.uniform(0.8, 0.98), 2),
        "topic_category": topic_category,
        "source_platform": SOURCE_PLATFORM,
        "event_details": event_details
    }
    return record

def main():
    """Generates data for the last 30 days and provides analysis."""
    all_rows_to_insert = []
    today = datetime.date.today()

    print("Generating mock data for 3 personas over the last 30 days...")
    # Loop from day 0 (30 days ago) to day 29 (today)
    for i in range(30):
        current_date = today - datetime.timedelta(days=29 - i)
        for persona in PERSONAS:
            num_outputs_per_day = random.randint(5, 10)
            for _ in range(num_outputs_per_day):
                # Pass the day_index (i) to the generation function
                record = generate_random_record(current_date, persona, i)
                all_rows_to_insert.append(record)

    # Sort the final list by timestamp for chronological order
    all_rows_to_insert.sort(key=lambda x: x['timestamp'])

    print(f"\nGenerated a total of {len(all_rows_to_insert)} records.")

    # --- Analysis Section ---
    for persona in PERSONAS:
        records = [r for r in all_rows_to_insert if r['user_id'] == persona['user_id']]
        distribution = {
            "IMMEDIATE_FLAG": 0,
            "INTERMEDIATE_FLAG": 0,
            "NEUTRAL_FLAG": 0
        }
        for r in records:
            if r['signal_type'] in distribution:
                distribution[r['signal_type']] += 1

        print(f"\n--- Distribution for Persona: {persona['description']} (User ID: {persona['user_id']}) ---")
        print(distribution)

    print("\n--- Example Record (Latest) ---")
    if all_rows_to_insert:
        print(json.dumps(all_rows_to_insert[-1], indent=2))
    else:
        print("No records were generated.")

    # --- HTTP Request Section ---
    if not all_rows_to_insert:
        print("\nSkipping HTTP request as no data was generated.")
        return

    try:
        print(f"\nAttempting to send {len(all_rows_to_insert)} records to the endpoint...")
        response = requests.post(ENDPOINT_URL, json=all_rows_to_insert)

        print(f"Server returned status code: {response.status_code}")
        print(f"Server response content: {response.text}")

        response.raise_for_status()

        print("\nRequest successful!")
        print("--- Response ---")
        print(json.dumps(response.json(), indent=2))

    except requests.exceptions.RequestException as e:
        print("\nAn error occurred while making the HTTP request.")
        print(f"Error: {e}")


if __name__ == "__main__":
    main()