#!/bin/bash
set -e

echo "🔥 Preparing Node services locally (deps + Prisma + build)..."

SERVICES=("users-service" "orders-service" "kyc-service" "legal-service")

for SERVICE in "${SERVICES[@]}"; do
  echo
  echo "==============================="
  echo "👉 Service: $SERVICE"
  echo "==============================="

  cd "services/$SERVICE"

  echo "📦 npm install (host)..."
  npm install

  echo "📦 Installing missing runtime + types..."
  npm install date-fns
  npm install -D @types/express @types/cors @types/morgan @types/jsonwebtoken @types/bcryptjs @types/cookie-parser

  echo "🧬 Pinning Prisma to v5 (schema-compatible)..."
  npm install @prisma/client@5.22.0 --save
  npm install prisma@5.22.0 --save-dev

  echo "🧬 Running Prisma generate..."
  npx prisma generate

  echo "🏗️ Building TypeScript..."
  npm run build

  cd ../../
done

echo
echo "✅ All Node services prepared: node_modules + dist are ready."
