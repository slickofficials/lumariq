#!/bin/bash
set -e

echo "🔥 Patching Dockerfiles for offline-friendly Node services..."

SERVICES=("users-service" "orders-service" "kyc-service" "legal-service")

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_PATH="services/$SERVICE"

  if [ ! -d "$SERVICE_PATH" ]; then
    echo "⚠️ Skipping missing: $SERVICE_PATH"
    continue
  fi

  # Pick correct entry file per service
  START_FILE="dist/index.js"
  if [[ "$SERVICE" == "users-service" || "$SERVICE" == "legal-service" ]]; then
    START_FILE="dist/server.js"
  fi

  echo "🔧 Rewriting $SERVICE_PATH/Dockerfile for offline build (start = $START_FILE)"

  cat > "$SERVICE_PATH/Dockerfile" << DOCKER
FROM node:20-alpine

WORKDIR /app

# We assume node_modules + dist are built on the host already
COPY package*.json ./
COPY node_modules ./node_modules
COPY dist ./dist

ENV NODE_ENV=production

# Optional: unprivileged user
RUN addgroup -S app && adduser -S -G app app
USER app

CMD ["node", "$START_FILE"]
DOCKER

done

echo "✅ All Node service Dockerfiles patched for offline builds."
