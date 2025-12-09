#!/bin/bash

echo "🔥 Generating clean production-grade docker-compose.yml ..."

cat <<EOF > docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: lumariq
      POSTGRES_PASSWORD: lumariq
      POSTGRES_DB: lumariq_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
      - "5672:5672"

  api-gateway:
    build: ./services/api-gateway
    depends_on:
      - users-service
      - orders-service
      - kyc-service
      - legal-service
    environment:
      DATABASE_URL: postgresql://lumariq:lumariq@postgres:5432/lumariq_db
    ports:
      - "3000:3000"

  users-service:
    build: ./services/users-service
    environment:
      DATABASE_URL: postgresql://lumariq:lumariq@postgres:5432/lumariq_db

  orders-service:
    build: ./services/orders-service
    environment:
      DATABASE_URL: postgresql://lumariq:lumariq@postgres:5432/lumariq_db

  kyc-service:
    build: ./services/kyc-service
    environment:
      DATABASE_URL: postgresql://lumariq:lumariq@postgres:5432/lumariq_db

  legal-service:
    build: ./services/legal-service
    environment:
      DATABASE_URL: postgresql://lumariq:lumariq@postgres:5432/lumariq_db

volumes:
  pgdata:
EOF

echo "🔥 docker-compose.yml patched successfully!"