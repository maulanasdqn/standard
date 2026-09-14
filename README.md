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
  version/      APP_VERSION, re-exported from the root package.json
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

## Version and Health

The root `package.json` version is the single source of truth for the workspace. `@app/version` re-exports it as `APP_VERSION` — a plain JSON import, no build step and no generated file — and both sides serve it:

| Surface | Response |
|---|---|
| `health.check` over RPC, `GET /api/health` | `{ status: "ok", version }` |
| `GET /healthz`, `GET /ready` | `{ status, version }` |
| `/health` on the web (no auth) | its own version next to the API's |

The shape is `healthSchema` in `@app/schemas`, so the web page is typed against what the API returns; the two versions differing means web and API are deployed out of step.

**Every change bumps the root version** — patch for a fix, chore, or docs change; minor for a feature or behavior-changing refactor; major for a breaking change. Bump it in the same commit, so `/health` always names the build you are looking at. Only the root version matters; the workspace packages are private and unpublished.

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

PRs use `.github/PULL_REQUEST_TEMPLATE.md` — fill every section in place, writing "None" rather than deleting one. Reviews use `.github/PULL_REQUEST_REVIEW_TEMPLATE.md` and always cover three sections: **Functional** (correctness, and whether every Changelog bullet is actually implemented), **Clean Code** (the conventions in `.claude/skills/ts-conventions/SKILL.md`, plus duplication and naming), and **Feature Suggestions** (non-blocking, each tagged `this-pr` or `follow-up`). Findings in the first two carry a P0–P3 severity from the template's legend.

The root version is already current, so a release just rounds it to the release number:

```sh
npm version X.Y.Z --no-git-tag-version
git add -A && git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z && git push origin trunk --follow-tags
```

The release workflow verifies CI is green, then publishes a GitHub release with notes from conventional commits.
