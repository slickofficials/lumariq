# Use a fuller base image (not slim) for production stability
FROM python:3.11-bullseye

# Set working directory
WORKDIR /app

# Install system dependencies needed by torch and scientific libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    libopenblas-dev \
    libomp-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip/setuptools/wheel for better package handling
RUN pip install --upgrade pip setuptools wheel

# Copy requirements first for layer caching
COPY requirements.txt .

# Install Python dependencies (pin torch to a stable release)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Healthcheck for production monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/healthz || exit 1

# Run the service
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]