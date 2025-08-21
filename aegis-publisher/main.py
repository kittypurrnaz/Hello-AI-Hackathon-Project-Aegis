from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import pubsub_v1
import os
import json
from typing import List, Optional, Dict, Any

app = FastAPI()

origins = [
    "chrome-extension://npaoakoaaldapklgolhgmifigkdnpfne"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pub/Sub Configuration ---
# Create a publisher client
publisher = pubsub_v1.PublisherClient()

# Get the environment variables for your project and topic
PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
TOPIC_ID = os.environ.get("PUB_SUB_TOPIC_ID")

if not all([PROJECT_ID, TOPIC_ID]):
    raise ValueError("Missing environment variables for Pub/Sub configuration.")

# Construct the full path to the topic
TOPIC_PATH = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# --- Pydantic Models (unchanged) ---
class EventDetails(BaseModel):
    context: Optional[str] = None
    corroborating_signals: Optional[List[str]] = None

class SignalData(BaseModel):
    user_id: str
    timestamp: str
    signal_type: str
    flag_type: str
    confidence: float
    topic_category: Optional[str] = None
    source_platform: Optional[str] = None
    event_details: Optional[EventDetails] = None

# --- CONVERTED ENDPOINT ---
@app.post("/upload_data")
async def upload_data(rows: List[SignalData]):
    """
    Receives a list of JSON objects, validates them against the Pydantic model,
    and publishes each as a message to a Pub/Sub topic.
    """
    published_count = 0
    
    try:
        for row in rows:
            # Pydantic models can be converted to a dictionary using .model_dump()
            data_dict = row.model_dump()
            
            # Pub/Sub messages must be a byte string.
            # Convert the dictionary to a JSON string and then encode it to bytes.
            data = json.dumps(data_dict).encode("utf-8")
            
            # Publish the message to the topic.
            # The .result() method blocks until the publish is complete,
            # ensuring all messages are sent before the function returns.
            future = publisher.publish(TOPIC_PATH, data)
            future.result()  # Wait for the publish to succeed
            published_count += 1

        return {"status": "success", "messages_published": published_count}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pub/Sub publish failed: {str(e)}")

@app.get("/")
def health_check():
    return {"status": "ok"}