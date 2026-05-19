# =============================================================================
# GSD Onboarding/Offboarding — Makefile
# Shortcuts for Docker Compose operations
#
# Requirements: make (Linux/Mac built-in; Windows: install via choco/winget)
# Alternative on Windows: run the docker compose commands directly.
# =============================================================================

.PHONY: help setup up dev down restart logs logs-bot logs-hub build clean ps

## Show available commands
help:
	@echo ""
	@echo "  GSD Onboarding/Offboarding"
	@echo "  ─────────────────────────────────────────────"
	@echo "  make setup     First-time setup (copies .env.example)"
	@echo "  make up        Start all services (production)"
	@echo "  make dev       Start all services (dev + hot reload)"
	@echo "  make down      Stop all services"
	@echo "  make restart   Rebuild images and restart"
	@echo "  make logs      Follow all logs"
	@echo "  make logs-bot  Follow slack-bot logs only"
	@echo "  make logs-hub  Follow hub logs only"
	@echo "  make ps        Show running containers"
	@echo "  make clean     Remove containers, volumes and images"
	@echo ""

## First-time setup: copy .env.example if .env doesn't exist
setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ .env created from .env.example — fill in your credentials before starting."; \
	else \
		echo "ℹ️  .env already exists — skipped."; \
	fi

## Start production (named volumes, no bind mounts)
up:
	docker compose up -d --build
	@echo "✅ Services started. Logs: make logs"

## Start with hot reload (bind mounts, --watch)
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

## Stop all services
down:
	docker compose down

## Rebuild images and restart without losing data
restart:
	docker compose down
	docker compose up -d --build

## Follow all service logs
logs:
	docker compose logs -f

## Follow only slack-bot logs
logs-bot:
	docker compose logs -f slack-bot

## Follow only hub logs
logs-hub:
	docker compose logs -f hub

## List running containers and their status
ps:
	docker compose ps

## Remove everything (containers + volumes + images) — DATA WILL BE LOST
clean:
	@echo "⚠️  This will delete all containers, volumes and images."
	@read -p "Are you sure? [y/N] " ans && [ "$$ans" = "y" ] || exit 1
	docker compose down -v --rmi all
