import vertexai
from vertexai import agent_engines
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# 1. Fill in your agent's details
PROJECT_ID = "trainee-project-tianyi"
LOCATION = "us-central1"
agent_resource_name = "projects/943089436637/locations/us-central1/reasoningEngines/7574777496306974720"

# 2. Initialize the Vertex AI SDK
vertexai.init(project=PROJECT_ID, location=LOCATION)

# 3. Instantiate the AgentEngine class
remote_app = agent_engines.get(
    agent_resource_name,
)

app = Flask(__name__)
# Allow CORS for all origins
CORS(app, origins="*")

# This endpoint now accepts a POST request with a JSON body
@app.route('/ask-agent', methods=['POST'])
def ask_agent():
    # Get message and user_id from the JSON body
    data = request.get_json()
    message = data.get('message')
    user_id = data.get('user_id', 'frontend-user')
    session_id = data.get('session_id', None)

    if not message:
        return jsonify({"error": "No 'message' provided"}), 400

    try:
        if not session_id:
            remote_session = remote_app.create_session(user_id=user_id)
            session_id = remote_session["id"]
        
        # Collect all events into a single list
        events = []
        for event in remote_app.stream_query(
            user_id=user_id,
            session_id=session_id,
            message=message,
        ):
            events.append(event)
        
        # Return a single JSON response
        return jsonify({
            "session_id": session_id,
            "response": events
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import os
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))

# import vertexai
# from vertexai import agent_engines
# from flask import Flask, request, jsonify, Response
# from flask_cors import CORS
# import json

# # 1. Fill in your agent's details
# PROJECT_ID = "trainee-project-tianyi"
# LOCATION = "us-central1"
# agent_resource_name = "projects/trainee-project-tianyi/locations/us-central1/reasoningEngines/8814393293740703744"

# # 2. Initialize the Vertex AI SDK
# vertexai.init(project=PROJECT_ID, location=LOCATION)

# # 3. Instantiate the AgentEngine class
# remote_app = agent_engines.get(
#     agent_resource_name,
# )

# app = Flask(__name__)
# # Allow CORS for all origins, which is fine for development
# CORS(app, origins="*")

# def event_stream(user_id, message):
#     """A generator function that streams events from the agent."""
#     try:
#         remote_session = remote_app.create_session(user_id=user_id)
#         session_id = remote_session["id"]
        
#         # Stream events from the agent
#         for event in remote_app.stream_query(
#             user_id=user_id,
#             session_id=session_id,
#             message=message,
#         ):
#             # Send each event as a separate chunk
#             yield f"data: {json.dumps(event)}\n\n"
            
#     except Exception as e:
#         error_payload = {"error": True, "message": str(e)}
#         yield f"data: {json.dumps(error_payload)}\n\n"

# @app.route('/ask-agent', methods=['GET'])
# def ask_agent():
#     # Get message from the JSON body of the request
#     # data = request.get_json()
#     # message = data.get('message')
#     # user_id = data.get('user_id', 'frontend-user')

#     message = request.args.get('message')
#     user_id = request.args.get('user_id', 'frontend-user')
    
#     if not message:
#         return jsonify({"error": "No 'message' provided"}), 400

#     # Return a streaming response
#     return Response(event_stream(user_id, message), content_type='text/event-stream')

# if __name__ == '__main__':
#     import os
#     app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))