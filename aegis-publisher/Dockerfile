# Use a specific, stable Python version
FROM python:3.12-slim-bookworm

# Set the working directory
WORKDIR /app

# Copy and install dependencies first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 8080

HEALTHCHECK CMD curl --fail http://localhost:8080/

# Command to run the application with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
