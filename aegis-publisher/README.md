# Aegis Ingestion API

This repository contains the backend API service for the **Aegis** digital well-being monitoring application. The service is built with **FastAPI** to securely receive data, inspect it for sensitive information using the **Google Cloud Data Loss Prevention (DLP)** API, and then publish the validated data to a **Google Cloud Pub/Sub** topic.

This architecture ensures that sensitive data is not stored unnecessarily and that the data ingestion process is decoupled from the data processing pipeline, allowing for high throughput and scalability.

-----

## 🏗️ Architecture

The application follows a secure data ingestion and transfer architecture:

**Client → FastAPI Service (Cloud Run) → Pub/Sub → Downstream Pipeline**

  - **FastAPI Service:** A lightweight and scalable API that serves as the primary ingestion point. It receives data, validates it using Pydantic models, and then uses the DLP API to inspect the payload for sensitive information.
  - **Google Cloud DLP:** A service that scans the incoming data for specified sensitive information types (e.g., email addresses, phone numbers). The service can then take action, such as logging a warning or, as an option in the code, blocking the payload.
  - **Pub/Sub:** A fully managed, real-time messaging service that acts as a buffer. It reliably delivers messages to downstream services, such as a **Dataflow** pipeline or a Cloud Function, for further processing.

-----

## 🏃 How to Run the Application

### Prerequisites

Before you begin, ensure you have the following configured in your Google Cloud project:

  - **Google Cloud Project:** A project with billing enabled.
  - **Google Cloud SDK:** Installed and authenticated on your local machine.
  - **Required APIs Enabled:**
      - Cloud Run Admin API
      - Cloud Pub/Sub API
      - Cloud DLP API
  - **Service Account Roles:** Your service account (or the user account you're running with) needs the following IAM roles:
      - `roles/run.admin`
      - `roles/pubsub.publisher`
      - `roles/dlp.user`

### 1\. Installation

First, clone the repository and install the required Python packages using the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

The `requirements.txt` file should include the following:

```
fastapi
google-cloud-pubsub
google-cloud-dlp
pydantic
python-dotenv
uvicorn
```

### 2\. Set Up Environment Variables

Set the following environment variables in your terminal to configure the application. These values are used by the FastAPI service to connect to the correct Google Cloud resources.

```bash
export GCP_PROJECT_ID=[YOUR_GCP_PROJECT_ID]
export PUB_SUB_TOPIC_ID=[YOUR_PUB_SUB_TOPIC_ID]
```

### 3\. Create the Required Pub/Sub Topic

Use the `gcloud` command to create the Pub/Sub topic that the API will publish messages to.

```bash
gcloud pubsub topics create $PUB_SUB_TOPIC_ID
```

### 4\. Deploy the FastAPI Service

Deploy the FastAPI service to a new Cloud Run service. The following command will automatically containerize your application and deploy it.

```bash
gcloud run deploy [YOUR_CLOUD_RUN_SERVICE_NAME] \
    --source=. \
    --region=us-central1 \
    --allow-unauthenticated \
    --service-account=[YOUR_SERVICE_ACCOUNT_EMAIL] \
    --set-env-vars="GCP_PROJECT_ID=[YOUR_GCP_PROJECT_ID],PUB_SUB_TOPIC_ID=[YOUR_PUB_SUB_TOPIC_ID]"
```

Once deployed, Cloud Run will provide a URL for your live API endpoint.