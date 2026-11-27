# Standard

Standard is a full-stack TypeScript boilerplate. It uses moon + pnpm workspaces, Hono + oRPC, Drizzle, better-auth, React 19 + TanStack + Vite + Tailwind v4, Biome, Vitest and Playwright.

## Stack

| Function | Tool |
|---|---|
| Monorepo | moon + pnpm workspaces |
| API | Hono, oRPC (one router gives typed RPC and REST/OpenAPI), Effect for business logic |
| DB | Drizzle ORM + Postgres |
| Auth | better-auth, one role for each user |
| Jobs | RabbitMQ + Redis |
| Mail | nodemailer over SMTP, mailpit in development |
| Files | S3-compatible object storage through `@app/storage`, a local S3-compatible store in development |
| Web | React 19, TanStack (Router, Query, Form, Store), Vite, Tailwind v4, shadcn/ui |
| Quality | Biome, Vitest, Playwright |

## Layout

```
apps/
  api/          Hono + oRPC + Drizzle + Effect, one directory for each module
  api-e2e/      API integration tests
  web/          TanStack Router SPA, served under /app
  landing/      Astro landing page, served at / when LANDING_DIST_PATH is set
  web-e2e/      Playwright E2E tests
packages/
  schemas/      Zod schemas that api and web share
  components/   shadcn/ui primitives, guards and theme
  permissions/  permission catalog and role maps
  activity/     activity log
  queue/        RabbitMQ helper
  cache/        Redis cache port and rate limits
  mail/         nodemailer SMTP mailer
  storage/      S3-compatible object storage
  grpc/         gRPC server and client
  logger/       pino factory
  format/       date, money and string formatters
  messages/     message constants that users see
  migrations/   shared migration runner
  version/      APP_VERSION, from the root package.json
```

## Getting Started

### Requirements

You must have one of these tool sets:

- [moon](https://moonrepo.dev/docs/install) and [proto](https://moonrepo.dev/proto)
- Node 24 and pnpm 11

The `.prototools` file sets the version of each tool, proto included. If your proto version is older than the set version, `make install` stops and shows the version that you must install.

### Start the stack

1. Install the dependencies and `ste`:

   ```sh
   make install
   make ste-install
   ```

   `ste` checks the commit messages, `README.md`, `AGENTS.md` and the code with the STE rules. To also install its skills for your agent, run `ste install`.

2. Copy the environment files:

   ```sh
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. Start the Docker services, then migrate and seed the database:

   ```sh
   make setup
   ```

4. Start the API and the web app together:

   ```sh
   make up
   ```

To start one process only, use one of these commands:

```sh
make api                              # api on :3001
make web                              # web on :5173/app/
make landing                          # landing on :4321, sends /app to the web and /api to the api
```

### Environment and dependencies

The example environment files agree with the services in `docker-compose.dev.yml`. You do not have to change them for local development.

`apps/api/.env.example` shows all the variables that the API accepts. At boot, `envSchema` stops the API if a variable is missing or incorrect. Thus, the error does not occur later in a request.

In development, the web app sends requests to the API through the Vite same-origin proxy. It does not use `VITE_API_URL`. Thus, the session cookie stays first-party when the API uses a different localhost host or port.

The `catalog` in `pnpm-workspace.yaml` sets the versions of dependencies that two or more packages use (for example TypeScript, Vitest, React, zod, `ts-pattern` and `ts-belt`). A manifest refers to these versions as `catalog:`. To change a version for all packages, change it in the catalog.

### Seed users

| Email | Password |
|---|---|
| `admin@test.app` | `Password123` |
| `member@test.app` | `Password123` |
| `viewer@test.app` | `Password123` |

This password is the default only outside production. When `NODE_ENV=production`, the seed does not run if `SEED_PASSWORD` is not set. When `SEED_PASSWORD` is set, the seed makes only the admin user with that password. It does not make demo users or notes.

### Local services

- Mailpit receives all the mail that the API sends in development. To read the mail, go to `http://localhost:8025`
- The local object store keeps uploaded images. Its console is at `http://localhost:9101/rustfs/console/`. It uses the same credentials as the API

### Accounts and sign-in

When `SIGN_UP_ENABLED` in `@app/schemas` is `true`, all persons can make an account at `/app/register`. If only an admin must add users, set it to `false`. Then the API refuses sign-up, `/app/register` goes to `/app/login`, and the sign-up link is not shown.

A new user must confirm the email address before the user can sign in. In development, open the confirmation link in mailpit. To reset a forgotten password, go to `/app/forgot-password` and use the same procedure.

A password must have a minimum of 8 characters. It must have one uppercase letter, one lowercase letter and one number.

Seeded users and users that an admin makes are confirmed at the start.

An admin can do these tasks:

- Send an email invitation. The person who receives it sets their own password
- Deactivate a user. This signs the user out on all devices and blocks sign-in. It does not delete data
- See and revoke the sessions of a user
- Change the email address of a user. The user must then confirm the new address
- Turn off two-factor authentication for a user who does not have their device or their backup codes

### Two-factor authentication

All users can turn on two-factor authentication on the Account page with an authenticator app. After that, sign-in asks for a 6-digit code or one of ten backup codes. You can use each backup code one time only. You can trust a device for 30 days.

### Role limits

- A user cannot give a role or a permission that the user does not have
- A user cannot change a user whose role the user cannot give
- A user cannot edit the role that the user has
- Only a superadmin can make or manage a different superadmin

### Newsletter

The landing page and all blog pages have a newsletter sign-up form.

The API keeps each sign-up in the `newsletter_subscriber` table, not as a user, because a reader is not an account. A new sign-up has the status `pending`. If a person signs up two times, the API gives the same answer and keeps the address one time only.

Admins can see and remove sign-ups on `/app/subscribers`. These tasks need the `newsletter:read` and `newsletter:delete` permissions. The sign-up endpoint uses the same rate limit window as the API, but it has its own limit.

The API does not send newsletter mail at this time. There is no confirmation email and no send procedure.

## Version and Health

The version in the root `package.json` is the only source of the workspace version. `@app/version` exports it as `APP_VERSION`. It is a plain JSON import, so there is no build step and no generated file. The API and the web app both show this version:

| Surface | Response |
|---|---|
| `health.check` over RPC, `GET /api/health` | `{ status: "ok", version }` |
| `GET /healthz` | `{ status, version }`. Liveness only: the process answers, and no dependency is checked |
| `GET /ready` | `{ status, version, dependencies }`. Gives **503** when a dependency is not available |
| `/app/health` on the web (no auth) | The web version and the API version |
| `GET /metrics` | Prometheus text: request counts and durations by method, matched route and status, and process data. `METRICS_TOKEN` protects it, and production must have this token. Refer to [docs/operations/metrics.md](docs/operations/metrics.md) |

`healthSchema` in `@app/schemas` sets the shape of the response. Thus, the web page has the same types as the API response. If the two versions are different, the web app and the API do not have the same deployment.

**Each change must increase the root version** in the same commit. Thus, `/health` always shows the build that you look at. Use the correct increment:

- Patch: a fix, a chore or a documentation change
- Minor: a feature
- Major: a breaking change

Only the root version is important. The workspace packages are private and are not published.

## Commands

Use `make` or `moon` for all commands. Do not run a command from a package directory.

```sh
make help                             # all targets, each with a one-line description
make setup                            # services + migrate + seed
make services | services-stop         # docker: postgres, redis, rabbitmq, mailpit, object store
make api | web | landing | worker     # run one process
make db-migrate | db-seed | db-studio # database
make check | lint | test | build      # quality gates
make e2e                              # api + web end-to-end tests
make ci                               # all CI tasks, on the affected projects
make ste-install | ste-check          # install ste, then check README.md, AGENTS.md and the code with the STE rules
```

```sh
moon run :check                       # biome check (format + lint)
moon run :build                       # tsc --noEmit, all projects
moon run :test                        # unit tests
moon run web:test -- --coverage.reportsDirectory=coverage/second  # a second run, with a different coverage folder
moon run api:db-generate              # make a drizzle migration
moon run landing:new-post -- "<title>" # start a blog article and show its writing prompt
moon ci                               # the tasks that CI runs
```

## Releasing

### Branches

The project uses trunk-based development on `trunk`:

1. Make a short-lived branch from `trunk`
2. Commit the change. Before each commit, lefthook checks the commit message with `ste check commit`
3. Push the branch. Before each push, lefthook runs biome, the typecheck, the unit tests and `make ste-check`
4. When CI passes, squash-merge the branch

Dependabot keeps the dependencies up to date.

### Branch protection

`trunk` is protected. The rules also apply to admins:

| Rule | Effect |
|---|---|
| Pull request required | You cannot push directly to `trunk`. No approval is necessary, so you can merge your own pull request when CI passes |
| 3 required checks, strict | `Check, test, build (affected)`, `E2E (api + web)` and `Drizzle schema drift check` must pass. The branch must be up to date with `trunk` |
| Linear history, squash-only | The repository does not permit merge commits or rebase merges |
| Branch deleted on merge | The branch list shows only the work that continues |
| No force pushes or deletions | This rule applies to all users, admins included |

`E2E (api + web)` is a gate, not a test suite. The API suite and the web suite run as two parallel jobs. The gate shows their combined result, so the required check has one name. If a change has only Markdown, documentation and the root version, the two suites do not run. Thus, a documentation pull request passes in some seconds.

If your branch is behind `trunk`, rebase it on `trunk` and push it again. This keeps the history linear, and each commit on `trunk` passes CI.

### Pull requests and reviews

Use `.github/PULL_REQUEST_TEMPLATE.md` for each pull request. Complete all sections. If a section does not apply, write "None" in it. Do not delete a section.

Use `.github/PULL_REQUEST_REVIEW_TEMPLATE.md` for each review. A review always has these three sections:

- **Functional**: correctness, and a check that the pull request does each item in the Changelog
- **Clean Code**: the conventions in `.claude/skills/ts-conventions/SKILL.md`, duplicated code and names
- **Feature Suggestions**: optional items. Each item has the tag `this-pr` or `follow-up`

Each finding in the first two sections has a P0-P3 severity from the legend in the template.

### Releases

Releases are automatic. You do not have to do a manual step. Each merge to `trunk` has a version increase. When the checks of that commit pass, the workflow adds a tag to the commit.

The release notes come from the Changelog section of each pull request, not from the commit subjects. Thus, write that section for the persons who read the release page. For the release procedure, and for the procedure to run a failed publish again, refer to [docs/operations/deployment.md](docs/operations/deployment.md).

## Documentation

| Document | Contents |
|---|---|
| [AGENTS.md](AGENTS.md) | The rules for agents and new contributors, and the file to read before each task |
| [.claude/skills/ts-conventions/SKILL.md](.claude/skills/ts-conventions/SKILL.md) | All the TypeScript rules |
| [docs/adding-a-module.md](docs/adding-a-module.md) | All the files that a new module, endpoint or permission must change |
| [docs/effect-services.md](docs/effect-services.md) | Why a service is a const and an error is a class |
| [docs/blog.md](docs/blog.md) | The location of articles, how `new-post` starts an article, and the content checks |
| [docs/operations/](docs/operations/) | Deployment, backups, runbooks, alerts, credentials, retention, logs |
| [docs/kpi/](docs/kpi/) | The status of this repository against an external engineering standards rubric |
