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

"""A BigQuery agent that uses a custom tool to query data."""

from google.adk.agents import LlmAgent
from . import prompt
# Import the function from the new tools.py file
from .tools import execute_sql_query

MODEL = "gemini-2.5-pro"

bigquery_agent = LlmAgent(
    name="bigquery_agent",
    model=MODEL,
    instruction=prompt.BIGQUERY_AGENT_PROMPT,
    output_key="bigquery_data_output",
    tools=[
        execute_sql_query # Pass the function directly
    ],
)

# """A custom BigQuery tool for data access."""

# import json
# from typing import Any, List
# from google.cloud import bigquery
# #from google.adk import BaseTool, ToolContext, Parameter
# #from google.adk.tools import BaseTool, ToolContext, Parameter
# from google.adk.tools.base_tool import BaseTool
# from google.adk.tools.tool_context import ToolContext
# from google.adk import Parameter
# import google.auth

# """A BigQuery agent that uses a custom tool to query data."""

# from google.adk.agents import LlmAgent
# from google.adk.tools.agent_tool import AgentTool
# from google.adk.tools.bigquery import BigQueryTool
# from . import prompt

# MODEL = "gemini-2.5-pro"


# class BigQueryTool(BaseTool):
#     """A tool to execute SQL queries against a BigQuery table."""

#     def __init__(self, project_id: str, dataset_id: str, table_id: str):
#         self._client = bigquery.Client(project=project_id)
#         self._table_ref = f"{project_id}.{dataset_id}.{table_id}"
#         super().__init__(
#             name="execute_sql_query",
#             description=(
#                 "Executes a SQL query against the user_activity_analysis table "
#                 "to retrieve anonymized child digital well-being data. "
#                 "Input must be a valid SQL query."
#             ),
#             parameters=[
#                 Parameter(
#                     name="query",
#                     type=str,
#                     description="The SQL query to execute.",
#                     required=True,
#                 )
#             ],
#         )

#     async def run_async(self, tool_context: ToolContext, query: str) -> str:
#         """Executes the provided SQL query and returns the results as a JSON string."""
#         print(f"Executing query: {query}")
#         try:
#             job = self._client.query(query)
#             results = job.result()
#             rows = [dict(row) for row in results]
#             return json.dumps(rows, indent=2)
#         except Exception as e:
#             error_message = f"An error occurred while executing the query: {str(e)}"
#             print(error_message)
#             return error_message

# bigquery_tool = BigQueryTool(
#     project_id="trainee-project-tianyi",
#     dataset_id="aegis_dataset",
#     table_id="user_activity_analysis",
# )

# bigquery_agent = LlmAgent(
#     name="bigquery_agent",
#     model=MODEL,
#     instruction=prompt.BIGQUERY_AGENT_PROMPT,
#     output_key="bigquery_data_output",  # Key for storing the raw JSON data
#     tools=[BigQueryTool],
# )