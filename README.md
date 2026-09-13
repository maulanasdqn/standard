# Standard

Full-stack TypeScript boilerplate — moon + pnpm workspaces, Hono + oRPC, Drizzle, better-auth, React 19 + TanStack + Vite + Tailwind v4, Biome, Vitest, Playwright.

## Stack

| Concern | Choice |
|---|---|
| Monorepo | moon + pnpm workspaces |
| API | Hono, oRPC (typed RPC + REST/OpenAPI from one router), Effect for business logic |
| DB | Drizzle ORM + Postgres |
| Auth | better-auth, one role per user |
| Jobs | RabbitMQ + Redis |
| Web | React 19, TanStack (Router, Query, Form, Store), Vite, Tailwind v4, shadcn/ui |
| Quality | Biome, Vitest, Playwright |

## Layout

```
apps/
  api/          Hono + oRPC + Drizzle + Effect
  api-e2e/      API integration tests
  web/          TanStack Router SPA
  web-e2e/      Playwright E2E
packages/
  schemas/      Zod schemas shared by api + web
  components/   shadcn/ui primitives + guards + theme
  permissions/  permission catalog + role maps
  activity/     activity log
  queue/        RabbitMQ helper
  storage/      S3-compatible object storage
  grpc/         gRPC server/client
  logger/       pino factory
  format/       date/money/string formatters
  messages/     user-facing message constants
  migrations/   shared migration runner
```

## Getting Started

Requires [moon](https://moonrepo.dev/docs/install) + [proto](https://moonrepo.dev/proto), or Node 24 / pnpm 11 directly.

```sh
pnpm install
make dev                              # start docker services (postgres, redis, rabbitmq)
make db-migrate && make db-seed       # create tables and seed users
make up                               # start api + web together
```

Or run them separately:

```sh
make api                              # api on :3001
make web                              # web on :5173
```

Seed logins: `admin@test.app` / `Password123`, `member@test.app` / `Password123`, `viewer@test.app` / `Password123`.

## Commands

```sh
make services                         # start docker services
make services-stop                    # stop docker services
make db-migrate                       # run migrations
make db-seed                          # seed database
make db-studio                        # open drizzle studio
make worker                           # run RabbitMQ worker
```

```sh
moon run :check                       # typecheck all
moon run :lint                        # lint all
moon run :test                        # test all
moon run :build                       # build all
moon run api:db-generate              # generate drizzle migration
```

## Releasing

Trunk-based development on `trunk`. Pre-push hooks run lint, format, and tests via lefthook. CI runs on every push. Dependabot keeps deps current.

```sh
pnpm -r exec npm version X.Y.Z --no-git-tag-version
npm version X.Y.Z --no-git-tag-version
git add -A && git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z && git push origin trunk --follow-tags
```

The release workflow verifies CI is green, then publishes a GitHub release with notes from conventional commits.
