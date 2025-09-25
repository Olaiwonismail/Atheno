# Use official lightweight Python image
FROM python:3.11-slim-bullseye

# Set environment vars
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install pip + Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Use non-root user (security best practice)
RUN adduser --disabled-password appuser
USER appuser

# Expose port
EXPOSE 8000

# Run the app (no reload in production)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
