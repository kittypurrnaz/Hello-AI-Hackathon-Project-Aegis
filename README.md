# Aegis Project

An AI-driven system engineered to deliver proactive, insightful reports and tailored guidance to parents concerning their adolescent children's online engagements, thereby promoting secure digital exploration and enhanced familial bonds.

## Table of Contents
* [Team Members](#team-members)
* [Project Summary](#project-summary)
* [How to Access the Demo](#how-to-access-the-demo)
* [Project Features](#project-features)
* [Technical Description](#technical-description)
* [Source Code](#source-code)

---

## Team Members
* **Fen Fei See** - Product Ideator & Marketing Manager
* **Gnaneshwar Rao** - Product Manager & Agentspace Developer
* **Dissa Naik** - Full Stack Developer
* **Samuel Ong** - Backend Developer
* **Sarah Ahmad** - Frontend Developer
* **Tian Yi Quek** - Chrome Extension Developer

---

## Project Summary
Aegis is an innovative AI system that provides parents with proactive, insightful reports and personalized guidance about their children's online activities. By leveraging AI to analyze digital engagements, Aegis helps parents promote secure online exploration for their children and strengthen familial bonds through informed conversations.

---

## How to Access the Demo
You can access the live demo of the Aegis frontend application and its features by visiting the following URL:

<https://aegis-frontend-service-943089436637.us-central1.run.app/>

To get started, simply navigate to the provided link and explore the dashboard.

---

## Project Features
The Aegis web application is designed to be intuitive and user-friendly, providing clear insights into your child's online activity.

### AI-Powered Reports
Detailed reports are available to help you understand your child's digital habits. To generate a report, simply go to the **"Reports"** tab and click on the **"Generate Report"** button. The system will then compile and present an easy-to-understand summary of their online activity, highlighting key areas of concern and providing actionable advice.

### Proactive Threat Detection
The dashboard provides a real-time overview of potential risks. Our AI-driven system continuously monitors for concerning signals and flags them immediately, allowing for timely intervention.

### Tailored Guidance
Beyond simple data, the Aegis agent offers personalized, empathetic guidance. This conversational tool helps you understand the context behind the data and provides suggestions on how to approach sensitive topics with your child.

---

## Technical Description
Aegis is built on a robust, full-stack architecture powered by Google Cloud.

* **Frontend**: The user interface is built with **React** and **TypeScript**. It features a responsive design created in **Figma** and implemented with **Tailwind CSS v4** and **ShadCN UI components**. The dashboard utilizes **Recharts** for clear data visualization.
* **Backend**: The backend is a robust ingestion hub built with **FastAPI** on **Google Cloud Run**. It uses **Pydantic** for strict data validation and **CORS** for secure communication. Data is streamed to **BigQuery** via **Pub/Sub** and processed by **Dataflow** for analysis.
* **Chrome Extension**: The **Manifest V3** Chrome extension collects data by monitoring web navigation. It uses the **Gemini API** for on-device text analysis of URLs and for visual context from screenshots. It authenticates with the **chrome.identity API** to securely communicate with the backend.
* **Agentspace AI**: The Aegis Agent provides conversational, context-aware guidance to parents. It uses data from **BigQuery** to generate empathetic and actionable advice in natural language.

---

## Source Code
The source code for the Aegis project is available on GitHub.

**GitHub Repository:** <https://github.com/kittypurrnaz/Hello-AI-Hackathon-Project-Aegis>
