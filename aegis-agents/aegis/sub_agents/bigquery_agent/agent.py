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

"""BigQuery agent for retrieving anonymized data."""
import os
from google.adk.agents import LlmAgent

from . import prompt

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
LOCATION = os.environ.get("GOOGLE_CLOUD_REGION")

MODEL = "gemini-2.5-pro"

bigquery_agent = LlmAgent(
    model=MODEL,
    name="bigquery_agent",
    instruction=prompt.BIGQUERY_AGENT_PROMPT,
    output_key="bigquery_data_output",
    # The tools list has been removed, as BigQueryTool is a conceptual tool.
    # The agent will now rely on its prompt to execute its task.
    tools=[],
)