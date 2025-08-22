# Aegis Mock Data Generator

This repository contains a Python script designed to generate realistic, story-driven mock data for the Aegis digital well-being monitoring application. The script simulates the browser activity of several personas, including trends of concerning behavior, and uses the **Vertex AI Gemini API** to create dynamic and plausible event details.

The final generated data is then sent to a specified API endpoint for ingestion, allowing for a complete end-to-end test of the data pipeline.

-----

## 🚀 Features

  * **Persona-Based Simulation:** The script creates data for predefined user personas, each with a unique behavioral pattern, simulating realistic user journeys over a 30-day period.
  * **Gemini API Integration:** It leverages the Vertex AI Gemini API to generate detailed and context-rich descriptions for specific flagged activities (e.g., self-injury, drugs, hateful conduct). This avoids static, repetitive data and provides more valuable insights.
  * **End-to-End Testing:** The generated data is formatted to be directly compatible with the Aegis ingestion API, enabling a comprehensive test of the entire data pipeline from client to BigQuery.
  * **HTTP Request:** The script automatically posts the generated data as a single batch to a specified API endpoint, simulating a real-world client-side application.

-----

## 🏃 How to Run the Script

### Prerequisites

Before you begin, ensure you have the following:

  * **Python 3.8+** installed.
  * A **Google Cloud Project** with billing enabled and the **Vertex AI API** enabled.
  * Your local machine authenticated with Google Cloud, typically via the `gcloud` CLI.
  * Access to the **Gemini 2.5 Flash Lite** model in the `us-central1` region.

### 1\. Set Up Environment Variables

Create a `.env` file in the same directory as the script and add the following variables. These are crucial for the script to know where to send the data and which Google Cloud project to use for the Gemini API.

```bash
# Replace with your own values
URL=[YOUR_API_ENDPOINT]
GCP_PROJECT_ID=[YOUR_GCP_PROJECT_ID]
```

### 2\. Install Dependencies

Install the required Python packages using pip.

```bash
pip install -r requirements.txt
```

A `requirements.txt` file should contain the following:

```
python-dotenv
requests
google-cloud-aiplatform
google-api-core
```

### 3\. Run the Script

Execute the `main.py` script from your terminal.

```bash
python3 main.py
```

The script will:

1.  Generate mock data for each persona over a 30-day period.
2.  Call the Gemini API for each non-neutral activity to get realistic details.
3.  Print a summary of the generated data, including the distribution of signal types for each persona.
4.  Send a POST request with the entire dataset to the `URL` endpoint you provided.
5.  Print the response from the server, confirming the successful data ingestion.