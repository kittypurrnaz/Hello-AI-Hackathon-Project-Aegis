from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import pubsub_v1, dlp_v2
import os
import json
from typing import List, Optional, Dict, Any

app = FastAPI()

origins = [
    "chrome-extension://npaoakoaaldapklgolhgmifigkdnpfne",
    "null"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pub/Sub Configuration ---
publisher = pubsub_v1.PublisherClient()
PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
TOPIC_ID = os.environ.get("PUB_SUB_TOPIC_ID")

if not all([PROJECT_ID, TOPIC_ID]):
    raise ValueError("Missing environment variables for Pub/Sub configuration.")

TOPIC_PATH = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# --- DLP Configuration ---
# Create a DLP client
dlp_client = dlp_v2.DlpServiceClient()

# Define the infoTypes to inspect for (e.g., PII, credit card numbers, email addresses)
INFO_TYPES = [
    {"name": "EMAIL_ADDRESS"},
    {"name": "CREDIT_CARD_NUMBER"},
    {"name": "PHONE_NUMBER"},
    {"name": "PERSON_NAME"}
]

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

@app.post("/upload_data")
async def upload_data(rows: List[SignalData]):
    """
    Receives a list of JSON objects, inspects them for sensitive data using DLP,
    and publishes each as a message to a Pub/Sub topic.
    """
    published_count = 0
    
    try:
        for row in rows:
            data_dict = row.model_dump()
            
            # --- DLP Inspection ---
            # Convert the data dictionary to a JSON string for DLP inspection
            data_to_inspect = json.dumps(data_dict)
            
            # The DLP API expects the parent project path
            parent = f"projects/{PROJECT_ID}"
            
            # Create a DLP request to inspect the data
            request = {
                "parent": parent,
                "inspect_config": {
                    "info_types": INFO_TYPES,
                    "min_likelihood": dlp_v2.Likelihood.LIKELY,
                },
                "item": {"value": data_to_inspect},
            }
            
            # Perform the DLP inspection
            response = dlp_client.inspect_content(request=request)
            
            # Check for any findings
            if response.result.findings:
                # If sensitive data is found, you can raise an error or log a warning
                print(f"Warning: Sensitive data found in a record. Findings: {response.result.findings}")
                # Optional: Uncomment the following line to block the request entirely
                # raise HTTPException(status_code=400, detail="Sensitive data detected in payload.")

            # If no sensitive data is found, proceed with Pub/Sub publish
            data = data_to_inspect.encode("utf-8")
            future = publisher.publish(TOPIC_PATH, data)
            future.result()
            published_count += 1

        return {"status": "success", "messages_published": published_count}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/")
def health_check():
    return {"status": "ok"}