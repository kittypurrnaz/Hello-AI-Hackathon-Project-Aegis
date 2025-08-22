from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import bigquery
import os
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

client = bigquery.Client()

PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
DATASET_ID = os.environ.get("BIGQUERY_DATASET_ID")
TABLE_ID = os.environ.get("BIGQUERY_TABLE_ID")

if not all([PROJECT_ID, DATASET_ID, TABLE_ID]):
    raise ValueError("Missing environment variables for BigQuery configuration.")

TABLE_REF = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"

# Define the new, fixed Pydantic models
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

# --- CORRECTED ENDPOINT ---
@app.post("/upload_data")
async def upload_data(rows: List[SignalData]):
    """
    Receives a list of JSON objects, validates them against the Pydantic model,
    and streams them to a BigQuery table.
    """
    try:
        # Pydantic models can be converted to a dictionary using .model_dump()
        json_rows = [row.model_dump() for row in rows]
        
        # Stream the data to the BigQuery table
        errors = client.insert_rows_json(TABLE_REF, json_rows)

        if errors:
            raise HTTPException(status_code=500, detail=f"BigQuery insert failed: {errors}")

        return {"status": "success", "rows_inserted": len(json_rows)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok"}