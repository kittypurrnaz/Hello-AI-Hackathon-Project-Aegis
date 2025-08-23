# Aegis: A Multi-Agent System for Digital Well-being

Aegis is a sophisticated multi-agent application designed to assist parents in understanding and managing their children's digital well-being. Built on the ADK (Agent Development Kit) framework, this system orchestrates a team of specialized AI agents to provide comprehensive analysis, empathetic advice, and conversational guidance based on anonymized data.

## 🌟 Key Features

* **Intelligent Routing**: A central `router_agent` intelligently directs user queries to the most suitable sub-agent.
* **Data-Driven Insights**: The system connects directly to a BigQuery dataset to ensure all advice and reports are based on real, anonymized user activity data.
* **Specialized Agents**: The system comprises four distinct agents, each with a specific purpose:
    * **`bigquery_agent`**: Fetches raw, anonymized data from BigQuery.
    * **`aegis_analysis_agent`**: Generates structured reports and summaries of digital trends.
    * **`empathetic_advice_agent`**: Provides compassionate, personalized advice for parents.
    * **`chat_agent`**: Handles general conversation and follow-up questions.
* **Seamless Data Flow**: Agents communicate and share information via a shared session state, allowing the output of one agent to serve as input for the next.

## 🚀 Getting Started

### Prerequisites

* Python 3.10+
* Google Cloud SDK configured with Application Default Credentials (ADC)
* ADK module installed
* Access to the specified BigQuery dataset (`trainee-project-tianyi.aegis_dataset.user_activity_analysis`)

### Installation

1.  Create a virtual environment and install dependencies:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    ```

### Running the Application

Use the ADK web server to run and test the agents locally:
```bash
adk web --agent_path agent.py