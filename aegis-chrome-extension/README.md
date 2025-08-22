# Aegis Chrome Extension

This repository contains the source code for the **Aegis** Chrome Extension, a client-side application that monitors browsing activity for digital well-being. The extension analyzes user's browsing history, URLs, and real-time screenshots to identify potentially harmful or concerning content, which is then securely sent to a backend data pipeline for further analysis and reporting.

---

## 🚀 Features

* **Real-time Monitoring:** The extension uses the `chrome.webNavigation` API to listen for completed page loads, triggering an analysis of the content.
* **Screenshot Analysis:** It captures screenshots of the active tab and sends them to the **Vertex AI Gemini API** for visual analysis of content.
* **URL & History Analysis:** It uses the **Vertex AI Gemini API** to analyze URLs for potential toxicity and reviews browsing history for behavioral patterns.
* **Toggleable Monitoring:** Users can enable or disable monitoring directly from the extension's popup, providing control over their privacy.
* **Secure Data Ingestion:** The analyzed data is securely sent to a backend API, which then publishes it to a Pub/Sub topic, ensuring the data is handled asynchronously and reliably.

---

## 🏗️ Architecture

The extension's logic is split into several files, each with a specific role:

* `background.js`: The core service worker script. It handles all event listeners (e.g., page navigation), manages the extension's state, and orchestrates the analysis process by calling functions from the `api.js` file.
* `api.js`: Contains all the logic for communicating with external services, including the **Vertex AI Gemini API** and the backend ingestion API. It is responsible for making network requests and handling responses.
* `config.js`: A simple configuration file to store all API endpoints, keys, project IDs, and other configurable parameters.
* `manifest.json`: The manifest file that declares the extension's metadata, permissions (`history`, `identity`, `offscreen`, `webNavigation`, etc.), host permissions, and OAuth2 settings. It is required for the extension to run in Chrome.

The data flow is as follows:

**User Browsing → `background.js` → `api.js` → Vertex AI & Ingestion API**

---

## 🏃 How to Run the Extension

### Prerequisites

* **Google Chrome:** You must have Google Chrome installed.
* **Google Cloud Project:** You will need a Google Cloud Project with billing enabled and the **Vertex AI API** enabled.
* **Service Account:** Your service account (or user account) must have the necessary IAM roles to access the Vertex AI API.
* **Backend API:** You must have the backend ingestion API deployed and running.

### 1. Configuration

1.  **Get Your OAuth2 Client ID:** In your Google Cloud project, navigate to **APIs & Services > Credentials** and create an OAuth 2.0 Client ID for a Chrome Extension.
2.  **Update `manifest.json`:**
    * Replace the placeholder `client_id` in `manifest.json` with the ID you obtained from the previous step.
    * Update the `host_permissions` with the URL of your deployed ingestion API.

3.  **Update `config.js`:**
    * Set the `BQ_API_ENDPOINT` to the URL of your deployed FastAPI ingestion service.
    * Set `GEMINI_PROJECT_ID` to your Google Cloud Project ID.

### 2. Installation

1.  **Go to Extension Management:** Open Chrome and navigate to `chrome://extensions`.
2.  **Enable Developer Mode:** Toggle the "Developer mode" switch in the top-right corner.
3.  **Load the Extension:** Click on the "Load unpacked" button and select the directory containing the extension's files.

The extension will now be active in your browser. You can click on the extension icon to see its status and toggle monitoring.