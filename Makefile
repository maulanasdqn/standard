COMPOSE := docker compose -f docker-compose.dev.yml
PROTO_PINNED := $(shell sed -n 's/^proto = "\(.*\)"/\1/p' .prototools)

.PHONY: help install toolchain setup services services-stop services-logs dev up \
	api web worker db-migrate db-seed db-generate db-push db-studio \
	check lint format test build ci browsers e2e e2e-api e2e-web clean \
	image image-run staging-up staging-down staging-migrate

help: ## List the available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-16s %s\n", $$1, $$2}'

install: toolchain ## Install workspace dependencies
	pnpm install

toolchain: ## Check that proto is at least the version pinned in .prototools
	@if ! command -v proto >/dev/null 2>&1; then \
		echo "proto is not installed, so moon tasks need Node and pnpm on PATH"; \
	elif [ "$$(printf '%s\n%s\n' "$(PROTO_PINNED)" "$$(proto --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)" | sort -V | head -n 1)" != "$(PROTO_PINNED)" ]; then \
		echo "proto $(PROTO_PINNED) or newer is required, found $$(proto --version). Run: proto upgrade"; \
		exit 1; \
	fi

setup: services db-migrate db-seed ## Start the services, migrate and seed

services: ## Start postgres, redis, rabbitmq, mailpit and the object store
	$(COMPOSE) up -d

services-stop: ## Stop the docker services
	$(COMPOSE) down

services-logs: ## Tail the docker service logs
	$(COMPOSE) logs -f

dev: services ## Start the services, then print the next steps
	@echo "Services up. Run 'make api' and 'make web' in separate terminals."

up: services ## Start the services, the api and the web together
	moon run api:dev web:dev

api: ## Run the api on :3001
	moon run api:dev

web: ## Run the web on :5173
	moon run web:dev

worker: ## Run the RabbitMQ worker
	moon run api:worker

db-migrate: ## Apply pending migrations
	moon run api:migrate

db-seed: ## Seed the database
	moon run api:db-seed

db-generate: ## Generate a drizzle migration from the schema
	moon run api:db-generate

db-push: ## Push the schema straight to the database
	moon run api:db-push

db-studio: ## Open drizzle studio
	moon run api:db-studio

image: ## Build the production container image
	docker build -t standard:$(shell node -p "require('./package.json').version") -t standard:latest .

image-run: ## Run the production image against the local services
	docker run --rm -p 3001:3001 --env-file apps/api/.env standard:latest

staging-up: ## Start the staging stack from .env.staging
	docker compose -f docker-compose.staging.yml --env-file .env.staging up -d

staging-migrate: ## Apply migrations against the staging database
	docker compose -f docker-compose.staging.yml --env-file .env.staging run --rm api node src/scripts/migrate.ts

staging-down: ## Stop the staging stack, keeping its volumes
	docker compose -f docker-compose.staging.yml --env-file .env.staging down

check: ## Biome check across the workspace
	moon run :check

lint: ## Biome lint across the workspace
	moon run :lint

format: ## Biome format --write across the workspace
	moon run :format

test: ## Unit tests across the workspace
	moon run :test

build: ## Typecheck and build across the workspace
	moon run :build

ci: ## Everything CI runs, on affected projects
	moon ci

browsers: ## Install the Playwright browsers
	moon run web-e2e:install-browsers

e2e-api: ## API end-to-end tests
	moon run api-e2e:e2e

e2e-web: ## Web end-to-end tests
	moon run web-e2e:e2e

e2e: e2e-api e2e-web ## All end-to-end tests

clean: ## Clear the moon cache
	moon clean
