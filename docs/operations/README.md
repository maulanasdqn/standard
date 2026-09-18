# Operations

What it takes to run this stack somewhere other than a laptop, and what to do when it misbehaves.

| Document | Answers |
|---|---|
| [deployment.md](deployment.md) | How a commit becomes a running process, and how to roll it back |
| [backup-restore.md](backup-restore.md) | What is backed up, how often, and how a restore is proven to work |
| [runbooks.md](runbooks.md) | What to do when a specific thing breaks |
| [alerting.md](alerting.md) | What pages someone, at what threshold, and who |
| [credentials.md](credentials.md) | What each credential actually allows, next to what the application restricts itself to |

## Processes

The workspace runs as two long-lived processes from one image:

| Process | Command | Serves |
|---|---|---|
| API | `pnpm --filter @app/api start` | HTTP on `PORT`, and the built SPA when `WEB_DIST_PATH` is set |
| Worker | `pnpm --filter @app/api worker` | RabbitMQ consumers, no HTTP |

The worker is not optional. Without it, published jobs accumulate in their queue and nothing drains the retry or dead-letter queues.

## Backing services

| Service | Required by | Loss of it means |
|---|---|---|
| Postgres | Both | Total outage. Readiness fails and the API stops accepting traffic |
| Redis | API | Rate limiting fails closed and job de-duplication stops, so requests are rejected rather than served wrongly |
| RabbitMQ | Both | Job publishing fails. HTTP requests that do not publish jobs keep working |
| SMTP | API | Mail silently stops. Nothing else is affected |

## Environments

| Environment | `NODE_ENV` | Notes |
|---|---|---|
| Local | `development` | `make setup` brings up Postgres, Redis, RabbitMQ and mailpit through `docker-compose.dev.yml` |
| CI | `test` | Services are declared per job in `.github/workflows/ci.yml` |
| Staging | `production` | Not yet provisioned. Provision it before the first production deploy, because a rollback has never been rehearsed anywhere else |
| Production | `production` | `envSchema` refuses to start unless `WEB_ORIGIN` and `BETTER_AUTH_URL` are HTTPS and `BETTER_AUTH_SECRET` is at least 32 characters |

Configuration is environment variables only, validated at boot by `apps/api/src/platform/config/env-schema.ts`. `apps/api/.env.example` is the full list. A missing or malformed variable stops the process at startup rather than failing later in a request.
