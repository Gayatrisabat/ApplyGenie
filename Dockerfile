# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Build static production assets
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Final Python + Playwright Environment
# ==========================================
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies required by Playwright Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browser binaries (Chromium only for lightweight runs)
RUN playwright install chromium

# Copy Python codebase and configurations
COPY src/ ./src/
COPY config/ ./config/
# Ensure data directories exist
RUN mkdir -p data/resumes data/resumes/tailored logs

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose standard production port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Run ASGI server via Uvicorn bound to 0.0.0.0
CMD ["uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "8000"]
