# Aegis Consumer Service

This repository contains the backend service for the **Aegis** digital well-being monitoring application. The service is a data pipeline that uses **FastAPI** to receive data via an API endpoint and then streams that data to **Google Cloud Pub/Sub**. This design allows for real-time data ingestion while the heavy data processing is handled asynchronously by **Google Cloud Dataflow**.

The application is designed to be deployed on **Google Cloud Run** and works with a separate Dataflow pipeline to process and store data in **BigQuery**.

-----

## 🏗️ Architecture

The application follows a simple data pipeline architecture:

**Chrome Extension → FastAPI Service (Cloud Run) → Pub/Sub → Dataflow → BigQuery**

  - **FastAPI Service:** A lightweight API that serves as the ingestion point for all data from client applications (e.g., a Chrome extension). It validates the incoming data and publishes it to a Pub/Sub topic.
  - **Pub/Sub:** A fully managed messaging service that decouples the ingestion service from the data processing pipeline. This ensures that the API remains responsive even under high load.
  - **Dataflow:** A serverless, fully managed service that runs the Apache Beam pipeline. It listens to the Pub/Sub topic, processes the data, and streams it into the final destination.
  - **BigQuery:** A serverless data warehouse where all the processed data is stored for analysis and reporting.

-----

## 🏃 How to Run the Application

### Prerequisites

Before you begin, ensure you have the following tools and services configured:

  - **Google Cloud Project:** A project with billing enabled.
  - **Google Cloud SDK:** Installed and authenticated on your local machine.
  - **Required APIs Enabled:**
      - Cloud Run Admin API
      - Cloud Pub/Sub API
      - BigQuery API
      - Dataflow API
      - Cloud Storage API
  - **Service Account Roles:** Your service account needs the following IAM roles:
      - `roles/dataflow.admin`
      - `roles/storage.objectAdmin`
      - `roles/pubsub.editor`
      - `roles/bigquery.dataEditor`
  - **Cloud Storage Bucket:** A bucket to be used as a temporary location for Dataflow.

### 1\. Set Up Environment Variables

Set the following environment variables in your terminal to configure the application.

```bash
# Replace bracketed values with your own.
export GCP_PROJECT_ID=[YOUR_PROJECT_ID]
export PUB_SUB_TOPIC_ID=[YOUR_PUB_SUB_TOPIC_ID]
export BIGQUERY_DATASET_ID=[YOUR_BIGQUERY_DATASET_ID]
export BIGQUERY_TABLE_ID=[YOUR_BIGQUERY_TABLE_ID]
export TEMP_CLOUD_STORAGE=[YOUR_BUCKET_NAME]
```

### 2\. Create the Required Resources

Use the `gcloud` and `bq` commands to create the necessary resources in your project.

```bash
# Create a Pub/Sub topic for the data pipeline
gcloud pubsub topics create $PUB_SUB_TOPIC_ID

# Create a BigQuery dataset and table for the data
bq mk --dataset --project_id $GCP_PROJECT_ID $BIGQUERY_DATASET_ID
bq mk --table --project_id $GCP_PROJECT_ID $BIGQUERY_DATASET_ID.$BIGQUERY_TABLE_ID \
    --schema='user_id:STRING,timestamp:TIMESTAMP,signal_type:STRING,flag_type:STRING,confidence:FLOAT,topic_category:STRING,source_platform:STRING,event_details:RECORD'
```

### 3\. Deploy the FastAPI Service

Deploy the FastAPI service to a new Cloud Run service.

```bash
gcloud run deploy aegis-consumer \
    --source=. \
    --region=us-central1 \
    --set-env-vars=GCP_PROJECT_ID=$GCP_PROJECT_ID,PUB_SUB_TOPIC_ID=$PUB_SUB_TOPIC_ID \
    --allow-unauthenticated
```

This command will automatically containerize your FastAPI app, deploy it to Cloud Run, and set up the necessary environment variables.

### 4\. Run the Dataflow Pipeline

The Dataflow pipeline is a separate, continuously running job that listens to the Pub/Sub topic and streams data into BigQuery.

```bash
python3 main.py \
    --runner=DataflowRunner \
    --project=$GCP_PROJECT_ID \
    --region=us-central1 \
    --temp_location=gs://$TEMP_CLOUD_STORAGE/temp \
    --staging_location=gs://$TEMP_CLOUD_STORAGE/staging \
    --streaming \
    --job_name=aegis-consumer-pipeline
```

This command will submit your Python script to the Dataflow service, which will then run the pipeline to move data from Pub/Sub to BigQuery.