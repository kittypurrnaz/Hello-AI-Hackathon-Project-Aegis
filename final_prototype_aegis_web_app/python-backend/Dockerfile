# Use the official Python 3.11 image as the base
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 8080

# Define the command to run the application
# This is where the entry point is specified
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--timeout", "500", "app:app"]
