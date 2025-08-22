# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Aegis analysis agent for reports, advice, and trends."""
import os
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt
# --- CORRECTED IMPORT ---
from ..bigquery_agent import bigquery_agent

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
LOCATION = os.environ.get("GOOGLE_CLOUD_REGION")

MODEL = "gemini-2.5-pro"

aegis_analysis_agent = LlmAgent(
    model=MODEL, 
    name="aegis_analysis_agent",
    instruction=prompt.AEGIS_ANALYSIS_AGENT_PROMPT,
    output_key="aegis_analysis_output",
    tools=[
        AgentTool(agent=bigquery_agent),
    ],
)