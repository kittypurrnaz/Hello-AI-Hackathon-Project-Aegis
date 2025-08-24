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

# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""A function-based tool for BigQuery data access."""

import json
from google.cloud import bigquery
from typing import Dict, List, Any
import google.auth

_CREDENTIALS, _PROJECT_ID = google.auth.default()
# Instantiate the BigQuery client once with explicit credentials
_CLIENT = bigquery.Client(project=_PROJECT_ID, credentials=_CREDENTIALS)
_TABLE_REF = f"{_PROJECT_ID}.aegis_dataset.user_activity_analysis"

async def execute_sql_query(query: str) -> str:
    """
    Executes a SQL query against the user_activity_analysis table to retrieve
    anonymized child digital well-being data.

    Args:
    query: The SQL query to execute.

    Returns:
    A JSON string of the query results.
    """
    # Add this line to print the email of the principal making the call
    print(f"Authenticated as: {_CREDENTIALS.service_account_email}")
    print(f"Executing query: {query}")
    try:
        job = _CLIENT.query(query)
        results = job.result()
        rows = [dict(row) for row in results]
        return json.dumps(rows, indent=2)
    except Exception as e:
        error_message = f"An error occurred while executing the query: {str(e)}"
        print(error_message)
        return error_message


# """A function-based tool for BigQuery data access."""

# import json
# from google.cloud import bigquery
# from typing import Dict, List, Any

# # Instantiate the BigQuery client once
# _CLIENT = bigquery.Client(project="trainee-project-tianyi")
# _TABLE_REF = "trainee-project-tianyi.aegis_dataset.user_activity_analysis"

# async def execute_sql_query(query: str) -> str:
#     """
#     Executes a SQL query against the user_activity_analysis table to retrieve
#     anonymized child digital well-being data.

#     Args:
#         query: The SQL query to execute.

#     Returns:
#         A JSON string of the query results.
#     """
#     print(f"Executing query: {query}")
#     try:
#         job = _CLIENT.query(query)
#         results = job.result()
#         rows = [dict(row) for row in results]
#         return json.dumps(rows, indent=2)
#     except Exception as e:
#         error_message = f"An error occurred while executing the query: {str(e)}"
#         print(error_message)
#         return error_message