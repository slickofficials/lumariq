#!/bin/bash

echo "🔥 Starting Postgres..."
docker compose up -d postgres

echo "⏳ Waiting for Postgres to come online..."
sleep 8

SERVICES=("users-service" "orders-service" "kyc-service" "legal-service")

for SERVICE in "${SERVICES[@]}"; do
  echo "🔧 Running Prisma migrations for $SERVICE ..."
  cd services/$SERVICE
  npx prisma migrate deploy
  cd ../../
done

echo "🔥 Seeding users..."

cd services/users-service

cat <<EOF > prisma/seed.ts
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.user.create({
    data: {
      email: "admin@lumariq.com",
      password: "test123",
      fullName: "Admin User",
      role: "ADMIN"
    }
  });

  console.log("🔥 Admin user created.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

npm run build
node dist/prisma/seed.js

cd ../../

echo "🎉 DATABASE READY + SEEDED!"