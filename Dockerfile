# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    libva-dev \
    vainfo \
    sqlite3 \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/
COPY requirements.txt .

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Copy frontend files and build React app
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# Set back to app directory
WORKDIR /app

# Expose port for Flask
EXPOSE 5000

# Run Flask app
CMD ["flask", "run", "--host=0.0.0.0"]