.PHONY: setup services services-stop services-logs env install check lint format test build

setup: services env install
	@echo "Done. Services:"
	@docker compose -f docker-compose.dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

services:
	docker compose -f docker-compose.dev.yml up -d --wait

services-stop:
	docker compose -f docker-compose.dev.yml down

services-logs:
	docker compose -f docker-compose.dev.yml logs -f

env:
	@if [ -f "apps/api/.env.example" ] && [ ! -f "apps/api/.env" ]; then \
		cp apps/api/.env.example apps/api/.env; \
		echo "Created apps/api/.env from template"; \
	fi

install:
	pnpm install

check:
	moon run :check

lint:
	moon run :lint

format:
	moon run :format

test:
	moon run :test

build:
	moon run :build
