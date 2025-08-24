import vertexai
from vertexai import agent_engines

# 1. Fill in your agent's details
PROJECT_ID = "trainee-project-tianyi"
LOCATION = "us-central1"

# 2. Initialize the Vertex AI SDK
vertexai.init(project=PROJECT_ID, location=LOCATION)

# 3. Construct the full resource name
# Replace this with the exact resource name from your deployment output
agent_resource_name = "projects/943089436637/locations/us-central1/reasoningEngines/7574777496306974720"

# 4. Instantiate the AgentEngine class with the resource name
# This gives you the 'remote_app' object to interact with.
remote_app = agent_engines.get(
    agent_resource_name,
)

# ------------------------------------------------------------------
# Now you can use remote_app exactly as shown in the documentation
# ------------------------------------------------------------------

print(f"✅ Successfully connected to: {remote_app.resource_name}")

# For example, you can now create a session or send a query
remote_session = remote_app.create_session(user_id="u_aegis_test")
print("\nCreated Session:")
print(remote_session)

# And send a query
print("\nSending Query...")
for event in remote_app.stream_query(
    user_id="u_aegis_test",
    session_id=remote_session["id"],
    message="Provide parental advice for child 'Alice' that occurred in the last 7 days.",
):
    print(event)

# WARNING: the code below deletes the entire agent from agent engine sessions included
# To delete your agent and its sessions, uncomment the line below
# remote_app.delete(force=True)