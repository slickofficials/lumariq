SHELL := /bin/bash

.PHONY: help build up down logs ps restart clean prisma-generate prisma-migrate test lint

help:
	@echo "Lumariq Makefile"
	@echo "  make build           - Build all services via docker compose"
	@echo "  make up              - Start full stack"
	@echo "  make down            - Stop stack"
	@echo "  make logs            - Tail logs"
	@echo "  make ps              - Show running containers"
	@echo "  make restart         - Restart stack"
	@echo "  make prisma-generate - Generate Prisma client for all Node services"
	@echo "  make prisma-migrate  - Run Prisma migrations for all Node services"
	@echo "  make test            - Run basic tests (Node + Go + Rust)"
	@echo "  make clean           - Remove volumes & images (DANGEROUS)"

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

restart: down up

prisma-generate:
	cd services/users-service && npx prisma generate
	cd services/orders-service && npx prisma generate
	cd services/kyc-service && npx prisma generate
	cd services/legal-service && npx prisma generate

prisma-migrate:
	cd services/users-service && npx prisma migrate deploy
	cd services/orders-service && npx prisma migrate deploy
	cd services/kyc-service && npx prisma migrate deploy
	cd services/legal-service && npx prisma migrate deploy

test:
	cd services/users-service && npm test || true
	cd services/orders-service && npm test || true
	cd services/kyc-service && npm test || true
	cd services/legal-service && npm test || true
	cd services/dispatch-service && go test ./... || true
	cd services/wallet-ledger && cargo test || true

clean:
	docker compose down -v --rmi local