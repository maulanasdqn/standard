.PHONY: services services-stop db-migrate db-seed db-studio api web worker dev up

services:
	docker compose -f docker-compose.dev.yml up -d

services-stop:
	docker compose -f docker-compose.dev.yml down

db-migrate:
	cd apps/api && pnpm migrate

db-seed:
	cd apps/api && pnpm db:seed

db-studio:
	cd apps/api && pnpm db:studio

api:
	cd apps/api && pnpm dev

web:
	cd apps/web && pnpm dev

worker:
	cd apps/api && pnpm worker

dev: services
	@echo "Services up. Run 'make api' and 'make web' in separate terminals."

up: services
	cd apps/api && pnpm dev & cd apps/web && pnpm dev & wait
