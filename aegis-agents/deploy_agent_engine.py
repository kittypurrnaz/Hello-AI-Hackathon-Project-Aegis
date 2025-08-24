# deploy_agent_engine.py

# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Deployment script for the Aegis Agent Engine application."""

import os
import vertexai
from dotenv import load_dotenv
from vertexai import agent_engines

# CRITICAL: Import your root agent from the 'aegis' package.
# This assumes your project is structured as `aegis/agent.py`
from aegis.agent import root_agent

# Load environment variables from the .env file
load_dotenv()

# Get project details from environment variables
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")
STAGING_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_BUCKET")
AGENT_SERVICE_ACCOUNT = "aegis-agent-backend-server@trainee-project-tianyi.iam.gserviceaccount.com"

# Initialize Vertex AI
vertexai.init(
    project=PROJECT_ID,
    location=LOCATION,
    staging_bucket=STAGING_BUCKET
)

# This is the path to your requirements.txt file.
REQUIREMENTS_PATH = "requirements.txt"
requirements = []
if os.path.exists(REQUIREMENTS_PATH):
    with open(REQUIREMENTS_PATH, "r") as f:
        requirements = [line.strip() for line in f if line.strip()]

print(f"Deploying agent to project: {PROJECT_ID} in region: {LOCATION}")

# Deploy the agent to Agent Engine
# CRITICAL: Use the `extra_packages` argument to explicitly include
# your entire 'aegis' directory. This resolves the ModuleNotFoundError.
remote_app = agent_engines.create(
    agent_engine=root_agent,
    display_name="Aegis Agent",
    requirements=requirements,
    extra_packages=["aegis"],  # Explicitly package the 'aegis' folder
    service_account=AGENT_SERVICE_ACCOUNT
)

print(f"Remote app created: {remote_app.resource_name}")