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

"""Aegis: A router agent for digital well-being reports and advice."""
import os
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .sub_agents.aegis_analysis_agent.agent import aegis_analysis_agent
from .sub_agents.bigquery_agent.agent import bigquery_agent
from .sub_agents.empathetic_advice_agent.agent import empathetic_advice_agent
from .sub_agents.chat_agent.agent import chat_agent # Now import the chat_agent

MODEL = "gemini-2.5-pro"

router_agent = LlmAgent(
    name="router_agent",
    model=MODEL,
    description=(
        "An intelligent router agent that directs requests related to a child's "
        "digital well-being. It can call an analysis agent for reports and advice, "
        "a BigQuery agent for raw data needs, or a chat agent for conversation."
    ),
    instruction=prompt.ROUTER_AGENT_PROMPT,
    output_key="router_agent_output",
    tools=[
        AgentTool(agent=bigquery_agent),
        AgentTool(agent=aegis_analysis_agent),
        AgentTool(agent=empathetic_advice_agent),
        AgentTool(agent=chat_agent), # Added the chat_agent tool
    ],
)

root_agent = router_agent