# Standard

Full-stack TypeScript boilerplate: moon + pnpm workspaces, Hono + oRPC, Drizzle, better-auth, React 19 + TanStack + Vite + Tailwind v4, Biome, Vitest, Playwright.

## Stack

| Concern | Choice |
|---|---|
| Monorepo | moon + pnpm workspaces |
| API | Hono, oRPC (typed RPC + REST/OpenAPI from one router), Effect for business logic |
| DB | Drizzle ORM + Postgres |
| Auth | better-auth, one role per user |
| Jobs | RabbitMQ + Redis |
| Mail | nodemailer over SMTP, mailpit in dev |
| Web | React 19, TanStack (Router, Query, Form, Store), Vite, Tailwind v4, shadcn/ui |
| Quality | Biome, Vitest, Playwright |

## Layout

```
apps/
  api/          Hono + oRPC + Drizzle + Effect, organised by module
  api-e2e/      API integration tests
  web/          TanStack Router SPA
  web-e2e/      Playwright E2E
packages/
  schemas/      Zod schemas shared by api + web
  components/   shadcn/ui primitives + guards + theme
  permissions/  permission catalog + role maps
  activity/     activity log
  queue/        RabbitMQ helper
  cache/        Redis cache port + rate limiting
  mail/         nodemailer SMTP mailer
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
make setup                            # docker services, migrate and seed
make up                               # start api + web together
```

Or run them separately:

```sh
make api                              # api on :3001
make web                              # web on :5173
```

Seed logins: `admin@test.app` / `Password123`, `member@test.app` / `Password123`, `viewer@test.app` / `Password123`.

Mail sent in development is caught by mailpit, read it at `http://localhost:8025`.

## Version and Health

The root `package.json` version is the single source of truth for the workspace. `@app/version` re-exports it as `APP_VERSION` (a plain JSON import, no build step and no generated file), and both sides serve it:

| Surface | Response |
|---|---|
| `health.check` over RPC, `GET /api/health` | `{ status: "ok", version }` |
| `GET /healthz`, `GET /ready` | `{ status, version }` |
| `/health` on the web (no auth) | its own version next to the API's |

The shape is `healthSchema` in `@app/schemas`, so the web page is typed against what the API returns; the two versions differing means web and API are deployed out of step.

**Every change bumps the root version**: patch for a fix, chore, or docs change; minor for a feature or behavior-changing refactor; major for a breaking change. Bump it in the same commit, so `/health` always names the build you are looking at. Only the root version matters; the workspace packages are private and unpublished.

## Commands

Every command goes through `make` or `moon`; nothing shells into a package directory.

```sh
make help                             # every target, with a one-line description
make setup                            # services + migrate + seed
make services | services-stop         # docker: postgres, redis, rabbitmq, mailpit
make api | web | worker               # run one process
make db-migrate | db-seed | db-studio # database
make check | lint | test | build      # quality gates
make e2e                              # api + web end-to-end
make ci                               # everything CI runs, on affected projects
```

```sh
moon run :check                       # biome check (format + lint)
moon run :build                       # tsc --noEmit, every project
moon run :test                        # unit tests
moon run api:db-generate              # generate drizzle migration
moon ci                               # what CI runs
```

## Releasing

Trunk-based development on `trunk`. Branches are short-lived, branch off `trunk`, and squash-merge once CI is green. Pre-push hooks run biome and the typecheck plus unit tests via lefthook. Dependabot keeps deps current.

`trunk` is protected and the rules apply to admins too:

| Rule | Effect |
|---|---|
| Pull request required | No direct pushes to `trunk`; 0 approvals required, so you can merge your own once CI is green |
| 3 required checks, strict | `Check, test, build (affected)`, `E2E (api + web)` and `Drizzle schema drift check` must pass, and the branch must be up to date with `trunk` |
| Linear history, squash-only | Merge commits and rebase merges are disabled at the repo level |
| Branch auto-deleted on merge | Keeps the branch list honest about what is in flight |
| No force pushes or deletions | Applies to everyone, including admins |

A branch that has fallen behind must be rebased on `trunk` and re-pushed; that is what keeps the history linear and every commit on `trunk` CI-green.

PRs use `.github/PULL_REQUEST_TEMPLATE.md`. Fill every section in place, writing "None" rather than deleting one. Reviews use `.github/PULL_REQUEST_REVIEW_TEMPLATE.md` and always cover three sections: **Functional** (correctness, and whether every Changelog bullet is actually implemented), **Clean Code** (the conventions in `.claude/skills/ts-conventions/SKILL.md`, plus duplication and naming), and **Feature Suggestions** (non-blocking, each tagged `this-pr` or `follow-up`). Findings in the first two carry a P0–P3 severity from the template's legend.

Releases are automatic, and there is nothing to run by hand. Every merge to `trunk` carries a version bump, so the release workflow reads the root version on each push to `trunk`, waits for the three required checks to be green on that exact commit, tags it `vX.Y.Z`, and publishes a GitHub release with notes built from the conventional commits since the previous tag.

It is keyed on the tag rather than on the diff, so a version that already has a tag is skipped and the job is a no-op. That makes the workflow safe to re-run, and `workflow_dispatch` is there for exactly that: re-releasing a version whose publish failed after its checks went green.
