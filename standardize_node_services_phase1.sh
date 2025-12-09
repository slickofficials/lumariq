#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

SERVICES=("users-service" "orders-service" "kyc-service" "legal-service")

echo "🔥 Building all Node services locally (no Docker)..."
echo

for SVC in "${SERVICES[@]}"; do
  echo "==============================="
  echo "👉 Service: $SVC"
  echo "==============================="

  if [ ! -d "services/$SVC" ]; then
    echo "  ⚠️  Skipping, folder services/$SVC not found"
    echo
    continue
  fi

  cd "services/$SVC"

  echo "  🧹 Cleaning node_modules + dist..."
  rm -rf node_modules dist

  echo "  📦 npm install..."
  npm install

  echo "  🏗️ npm run build..."
  npm run build

  echo "  ✅ $SVC built successfully."
  echo

  cd "$ROOT_DIR"
done

echo "✅ All Node services built locally."
echo "Next: patch Dockerfiles to offline mode, then docker compose build."
