# Engineering Standards Compliance Matrix

The external engineering standards this matrix tracks are a **spec-review rubric**, not a set of measured KPIs: they list what every Engineering Spec and every build must already answer, without being restated per project. This document splits the rubric into 37 discrete, checkable standards, adds 16 the rubric never asks for but this boilerplate already ships, ranks all 53 P0–P3, and records where this repository stands on each.

## How to read this

**★ marks a standard the external rubric does not list.** Those 16 rows are what this boilerplate contributes on its own, and they are the reason the rubric rows that are already Done were cheap rather than expensive.

**Severity is the criticality of the standard itself**, using the P0–P3 legend from `.github/PULL_REQUEST_REVIEW_TEMPLATE.md`. It does not change with our status: a P0 standard stays P0 whether we pass it or not. Read `Severity` and `Status` together: `P0` + `Missing` is what to fix first.

| Severity | Meaning |
|----------|---------|
| P0 | Blocker: data loss, security hole, full outage, or an external action taken wrongly |
| P1 | High: significant incorrect behavior, or a handoff gap that stalls operations |
| P2 | Medium: misleading UX, missing coverage, unbounded growth |
| P3 | Low: cleanup and polish |

| Status | Meaning |
|--------|---------|
| Done | Met in the repository today, with evidence |
| Partial | Mechanism exists but is incomplete or unenforced |
| Missing | Not present |
| N/A | Not exercised by the current codebase; required the moment the capability lands |

**Boilerplate Ready** answers what a new product built on this repository inherits, which is not the same question as whether this repository meets the standard.

| Boilerplate Ready | Meaning |
|-------------------|---------|
| Yes | Inherited for free: generic, wired up, nothing product-specific to finish |
| Partial | The reusable part exists; the product finishes the standard on top of it |
| No | Nothing to inherit, so the next product builds this from scratch |

The rubric's domain examples (Drive filing, CSI terminology, rebid ambiguity) come from a document-filing product. This repository is a full-stack boilerplate with no AI model and no filing workflow, so those rows are marked N/A with the condition that makes them apply.

## Scorecard

| Severity | Total | ★ Beyond rubric | Done | Partial | Missing | N/A |
|----------|-------|-----------------|------|---------|---------|-----|
| P0 | 17 | 4 | 14 | 0 | 0 | 3 |
| P1 | 22 | 7 | 15 | 3 | 3 | 1 |
| P2 | 13 | 5 | 6 | 1 | 5 | 1 |
| P3 | 1 | 0 | 1 | 0 | 0 | 0 |
| **Total** | **53** | **16** | **36** | **4** | **8** | **5** |

The table above counts the **Status** column. **Boilerplate Ready** is a separate axis with its own values, so it is tallied separately: **36 Yes, 8 Partial, 9 No.** Both add up to 53, and the 32 appearing in each is a coincidence rather than a repeated figure: every standard that is Done is also inherited, but some rows that are only Partial or Missing here still hand the next product something reusable.

Every ★ row but one is a Yes, because the standards this boilerplate sets beyond the rubric are precisely what a new product inherits without writing a line.

## Matrix

| Title | Description | Severity | Status | Boilerplate Ready | Evidence / gap |
|-------|-------------|----------|--------|-------------------|----------------|
| Permissions enforced in the API, not only the UI | Every action checks permission server-side; the UI guard is cosmetic | P0 | Done | Yes | `permissionRequire` and `protectedProcedure` in `apps/api/src/platform/orpc/middleware.ts`; row-level scoping in `apps/api/src/platform/db/ownership.ts`; covered by `apps/api-e2e/tests/permissions.e2e.test.ts` and `roles.e2e.test.ts` |
| Data model agrees with APIs and workflows | Every field or state an API or workflow uses exists in the data model | P0 | Done | Yes | `@app/schemas` is the single zod source shared by api and web; the `Drizzle schema drift check` CI job regenerates migrations and fails on any divergence |
| Compound actions satisfy every permission they combine | An action that approves *and* files must pass both the review and the filing permission | P0 | Done | Yes | `permissionRequire(...required)` takes a list and `canAll` requires all of them; the mechanism is in place before such an action exists |
| ★ Secrets and transport are validated at boot | The process refuses to start on a weak secret or a plaintext production origin | P0 | Done | Yes | `envSchema` in `apps/api/src/platform/config/env-schema.ts` requires `BETTER_AUTH_SECRET` at 32 characters and rejects non-HTTPS `WEB_ORIGIN` / `BETTER_AUTH_URL` in production; `env-schema.security.test.ts` pins that behavior |
| ★ Authorization is data, not scattered code | One permission catalog drives the API middleware and the UI guards, so the two cannot drift | P0 | Done | Yes | `@app/permissions` (`permissions.ts`, `roles.ts`, `can.ts`, `labels.ts`) is consumed by `permissionRequire` on the api and by `Guard` / `RouteGuard` / `usePermissions` in `packages/components/src/guard` |
| ★ Roles are editable at runtime, not hardcoded | New roles are created and re-scoped without a deploy | P0 | Done | Yes | The `custom_role` table plus full CRUD in `apps/api/src/role/` and the permission checklist UI at `apps/web/src/routes/_authenticated/roles/` |
| ★ Every mutation writes an audit row | Who did what to which resource, recorded by the use-case rather than by a caller who might forget | P0 | Done | Yes | `ActivityRecorder` is a required dependency of every mutating use-case across `note/`, `role/`, and `user/` (create, update, delete, and password reset), surfaced with filters at `/activity` |
| Uniqueness rules have an enforceable mechanism | A promised uniqueness rule must be a constraint, not an intention | P0 | Done | Yes | `custom_role.key` is `.unique()` in `apps/api/src/platform/db/tables/custom-role.ts`, the drift check keeps constraints honest, and the job `messageId` is now enforced through an atomic claim rather than merely computed |
| Repeated submissions are de-duplicated | The same submission twice must not produce two external actions | P0 | Done | Yes | The worker claims the deterministic `messageId` from `packages/queue/src/job-publisher.ts` through the `TJobDedupe` port before running a handler and releases it on failure, backed by an atomic `setIfAbsent` in `@app/cache`, so a repeat delivery is skipped while a retry still runs |
| Retry with backoff on transient failure | Transient failures retry on a defined policy before being treated as failures | P0 | Done | Yes | `packages/queue/src/job-worker.ts` republishes a failed job to `<queue>.retry` with an exponential per-message delay and an attempt header, bounded by `JOB_RETRY_DEFAULT` |
| Failed work has a recovery path (dead letter) | Work that fails permanently is preserved for inspection and replay, never dropped | P0 | Done | Yes | `jobTopologyAssert` declares `<queue>.dlq` beside every queue, and a job that exhausts its attempt budget is parked there instead of discarded |
| Concurrency tests | Two reviewers, or a retry racing the original, must not create conflicting approvals or duplicate active items | P0 | Done | Yes | Notes carry a `version` that the update predicate matches and the write increments, so a stale edit updates no rows and returns 409 rather than overwriting. Two concurrent updates and a replayed stale update are covered in `apps/api-e2e/tests/notes.e2e.test.ts`. See the scope note below: this guard is deliberate, not blanket |
| Backup and restore | A defined, exercised backup and restore procedure for every stateful store | P0 | Done | Yes | `docs/operations/backup-restore.md` names what holds state and what deliberately is not backed up, sets retention and isolation, and defines a restore drill whose output is the measured recovery time and recovery point. The drill has not been run yet, so those two numbers are recorded as not yet measured rather than guessed |
| Duplicate prevention validated before enabling live action | Duplicate prevention and recovery are proven *before* the first real external action is allowed | P0 | Done | Yes | `packages/queue/src/job-worker.test.ts` covers retry routing, dead-lettering, and repeat suppression; the note concurrency tests cover the read-modify-write side against a real database |
| Validated rules decide, the model only suggests | The model proposes; validated application rules authorize | P0 | N/A | No | No model in the codebase: no `anthropic`, `openai`, `@ai-sdk`, or `langchain` dependency in any `package.json`. Applies the moment a model output can drive an action |
| Confidence alone never authorizes an external action | A high score is not an authorization | P0 | N/A | No | Same condition as above |
| Hard blockers override confidence | Missing content, stale project references, unresolved destinations, or rebid ambiguity block automatic action even at high confidence | P0 | N/A | No | Same condition as above |
| Module boundaries are enforced, not conventional | A module is reachable only through its public entry point | P1 | Done | Yes | Every module under `apps/api/src/<module>/` exposes an `index.ts`; the allowed edges live in `apps/api/scripts/architecture-rules.ts` and are enforced by `moon run api:arch`, which `api:build` depends on |
| ★ One router, two contracts | The typed RPC client and the OpenAPI document are generated from the same router, so the REST contract cannot fall behind | P1 | Done | Yes | `orpcMount` in `apps/api/src/platform/http/mount-orpc.ts` mounts an `RPCHandler` and an `OpenAPIHandler` with a reference UI, the spec stamped with `APP_VERSION` |
| ★ Abuse control at the edge, with honest client identity | Rate limiting that cannot be defeated by a spoofed forwarding header | P1 | Done | Yes | Scope-based `rateLimit` middleware over Redis, with `rate-limit-identifier.ts` resolving the client only through a configured `RATE_LIMIT_TRUSTED_PROXY_IPS` allowlist, and unit tests for both |
| ★ Request correlation | Every log line can be tied back to one request | P1 | Done | Yes | `requestId()` middleware in `apps/api/src/main.ts`, with `reqId`, method, path, status, and duration logged per request |
| ★ Conventions are enforced by tooling, not by reviewers | Style and architecture violations fail a command, not a conversation | P1 | Done | Yes | Biome for format and lint, `moon run api:arch` for module edges as an `api:build` dependency, lefthook pre-push running `:check` and `:build :test`, and `.claude/skills/ts-conventions/SKILL.md` as the written ruleset |
| ★ The client degrades when the API is down | An unreachable server is a handled state in the UI, not a blank screen | P1 | Done | Yes | `apps/web/src/libs/auth/server-unreachable.ts` and `session-reach.ts` with tests; loading and empty states driven by the router lifecycle, with shared `empty-state` and `data-table` primitives |
| ★ Releases prove what they contain | A release cannot be cut from an unverified commit or a mislabeled version | P1 | Done | Yes | `.github/workflows/release.yml` verifies the tag matches `package.json`, polls until all three required checks are green on that exact SHA, and builds notes from conventional commits |
| Every module defines its full contract | Trigger, inputs, validation, processing, outputs, saved state, external actions, failure path | P1 | Partial | Partial | The layering (`domain` / `application` / `infrastructure` / `presentation`), zod input validation, and the tagged errors in `apps/api/src/shared/errors.ts` cover inputs, validation, and the error vocabulary. No module states its trigger, its saved state, or its external actions anywhere |
| Unavailable services are handled deliberately | Each dependency has a defined behavior when it is down | P1 | Done | Yes | Each dependency has a stated behaviour. The rate limiter fails closed on a Redis error, readiness answers 503 on a dead Postgres or Redis, the web handles an unreachable api, and the broker connection is opened on first use rather than at boot, so the api starts and serves without RabbitMQ while a publish fails with `EQueue` and reconnects on the next attempt. The worker waits for the broker instead of dying silently |
| Health and readiness reflect real dependency state | A readiness probe that cannot fail is not a readiness probe | P1 | Done | Yes | `GET /ready` probes Postgres and Redis on a bounded timeout, reports each by name, and answers 503 when either is down. `GET /healthz` stays unconditional on purpose, because it answers liveness and restarting a process does not fix a dead database. Covered by unit tests on the aggregation and end to end against a real stack |
| Environments are specified | Named environments with their own configuration and guardrails | P1 | Partial | Partial | `envSchema` enumerates `development` / `test` / `production` and enforces production HTTPS. There is no staging environment and no non-dev compose file or manifest: `docker-compose.dev.yml` is the only one |
| Rollback is possible and defined | A deployed build can be identified and reverted | P1 | Done | Yes | Tagged releases plus `APP_VERSION` at `/health` identify the running build, and `docs/operations/deployment.md` defines expand and contract so a code rollback is never stranded behind a schema the older build cannot read. `moon run api:migrations` fails the build on `DROP COLUMN`, `RENAME COLUMN`, `DROP TABLE` and `SET NOT NULL`, with an explicit in-file marker for a deliberate contract phase, so the rule is enforced rather than remembered |
| ★ Infrastructure sits behind swappable ports | Cache, mail, queue, and storage are packages with interfaces and test fakes, not direct client calls in use-cases | P1 | Partial | Partial | `@app/cache` ships `cache-client-fake.ts` for tests; `@app/queue`, `@app/mail`, and `@app/logger` follow the same shape. `@app/storage` and `@app/grpc` are written and tested but imported by nothing yet |
| Partial processing is atomic | A multi-write operation either completes or leaves no trace | P1 | Done | Yes | Every mutating route runs inside one database transaction, opened at the oRPC seam by `effectRunTransactional` so the use cases and their unit tests stay free of a database. Repositories read the active connection rather than the pool captured when their layer was built, and better-auth receives a proxy that resolves it per call, so its user and password writes join the same transaction instead of committing on their own |
| Timeouts on every outbound call | A lost response must become a failure, not a hang | P1 | Done | Yes | Every outbound call the api owns is bounded: connection and statement timeouts on the Postgres pool, `commandTimeout` on Redis, connection, greeting and socket timeouts on SMTP, an `AbortSignal.timeout` on every `@app/storage` request, and a bounded readiness probe. better-auth is configured for email and password only, so it makes no outbound HTTP call of its own |
| Explicit intermediate state | States such as *approved but not yet filed* are stored explicitly, never implied by the gap between two steps | P1 | Missing | No | No domain table carries a lifecycle state column; `note` has no status field. Any future two-step action would leave its middle state unrepresented |
| Uncertain results are reconciled by a defined rule | What is uncertain, how it is reconciled, and what must reach a human | P1 | Missing | No | No review queue, no reconciliation rule, no human-review state |
| Alert ownership | Every alert has a named owner who receives it | P1 | Done | Yes | All nine alerts in `docs/operations/alerting.md` name an owner, with `fradotech` as the default that receives anything not reassigned. The document also says why a single default beats an empty column at this team size, and what to do when a second person shares the pager |
| Deployment is defined | How a build reaches an environment | P1 | Done | Yes | A `Dockerfile` builds both processes into one image tagged with the root version, `make image` builds it, and `docs/operations/deployment.md` fixes the order: migrate as a separate job, then roll the api, then the worker, with liveness on `/healthz` and readiness on `/ready` |
| Monitoring beyond logs | Metrics and traces, not only request lines | P1 | Missing | Partial | `apps/api/src/main.ts` logs structured request lines via the reusable `@app/logger` pino factory, good and the only signal. No metrics, no tracing, no log shipping |
| Provider permissions described separately from application restrictions | The account's real scope is stated apart from what the application chooses to allow, because an application allowlist does not narrow a broadly authorized account | P1 | Done | Yes | `docs/operations/credentials.md` describes every credential twice, as what the provider grants and what the application restricts itself to, so the gap between the two is visible. Object storage has no entry because no key exists yet, and the rules its first key must satisfy are written in advance |
| Held-out evaluation dataset | A held-out set with sample counts and dataset, model, and config versions, measuring correct automatic action, coverage, and review volume | P1 | N/A | No | No model in the codebase. Required before any model output is trusted |
| ★ CI runs only what changed | The task graph decides the work, so the pipeline stays fast as the repo grows | P2 | Done | Yes | moon projects declare `inputs` per task; `moon ci :check :build :test` runs affected projects only |
| ★ One deployable artifact | The API serves the built SPA, so there is a single process to ship and a single origin to configure | P2 | Done | Yes | `webDistMount(app, env.WEB_DIST_PATH)` in `apps/api/src/main.ts` |
| ★ A new machine reaches a working system in one command | Onboarding is a command, not a document | P2 | Done | Yes | `make setup` starts Postgres, Redis, RabbitMQ, and mailpit, then migrates and seeds; three known logins are documented in `README.md` |
| ★ A UI baseline ships with the boilerplate | Tables, pagination, empty states, confirm dialogs, theming, and responsiveness exist before the first feature | P2 | Done | Yes | shadcn/ui primitives in `packages/components/src/ui`, shared `data-table` / `list-pagination` / `empty-state` / `confirm-dialog`, a theme store, and `use-mobile` |
| ★ Dependencies are kept current automatically | Upgrades arrive as small reviewed PRs rather than an annual migration | P2 | Done | Yes | `.github/dependabot.yml`: weekly npm and github-actions updates, minor and patch grouped into one PR |
| Expired credentials are handled | Expiry is a recognized, recoverable state, not an unexplained error | P2 | Partial | Partial | better-auth handles session expiry, and `buildContext` in `apps/api/src/main.ts` degrades a failed session lookup to `null`. External provider credentials (SMTP, S3) have no expiry or re-auth handling, so they surface as a generic thrown error |
| Unreadable or oversized attachments | Size and type limits are enforced and rejections are explicit | P2 | Missing | Partial | `packages/storage/src/storage.ts` enforces no size or content-type limit, and `remove()` ignores the response status entirely. The package is also not imported anywhere yet, so there is no upload endpoint, but the limits must exist before one lands |
| Support and runbooks | A written procedure for the failures that are expected to happen | P2 | Done | Yes | `docs/operations/runbooks.md` covers readiness failure, Postgres and Redis outages, dead-lettered and stalled jobs, and a bad deploy, each starting from how you know rather than from what to type |
| Data retention | How long each class of data is kept, and what prunes it | P2 | Missing | No | `activity_log` (`apps/api/src/platform/db/tables/activity.ts`) grows without bound; no retention policy and no pruning job |
| Staged rollout | New behavior reaches a slice before everyone | P2 | Missing | No | No feature flags and no canary or percentage rollout |
| Acceptance scenarios cover failure and recovery | The demo or walkthrough maps to real acceptance scenarios, including the failure and recovery cases | P2 | Missing | Partial | `apps/api-e2e/tests` and `apps/web-e2e/tests` give a working harness with sign-in, access, and table helpers, but every spec covers a happy path or authorization. No test exercises a dependency outage, a retry, or a recovery |
| Baselines carry evidence | Source, units, measurement method, and approved event definitions for every reported saving or error baseline | P2 | Missing | No | No baseline or value-reporting definitions exist |
| Client-approved labels | Use the practical names the client already uses; do not impose a taxonomy that discovery did not call for | P2 | N/A | Partial | No client-facing taxonomy in this repository, but `@app/messages` is already the enforced home for every user-facing string, so approved copy lands in one reviewable place |
| Error responses are shaped consistently | Every failure reaches the client in one known shape | P3 | Done | Yes | `toORPCError` no longer copies a raw `Error.message` into the response. An unexpected failure becomes one `INTERNAL_SERVER_ERROR` carrying `ERROR_MESSAGE.INTERNAL`, with the original kept as `cause` so it still reaches the logs while being structurally absent from `toJSON`. Covered by `error-mapping.test.ts` |

## Where concurrency guards apply

The optimistic version on notes is **scoped on purpose, and is not a pattern to roll out across every table.** A version column buys protection against two people overwriting each other, and it costs a schema column, a required field on every update input, a new error path, and a reload-and-retry burden pushed onto whoever is editing.

That trade is worth making where concurrent editing is realistic and a silent overwrite either destroys work or produces a wrong decision. It is not worth making on a record that one administrator edits occasionally, or where the last write genuinely is the intended answer. Notes qualified because they are the module with a real editing surface; roles and users deliberately keep their simpler updates.

So a module that still uses a last-write-wins update is not automatically carrying a defect. Read this rubric row as satisfied by protecting what matters, never by adding a version column everywhere.

## Suggested order of work

**Every P0 is now closed.** Fourteen are Done and three stay N/A until a model is introduced, so what follows is P1 and below.

1. **Wrap multi-write operations in transactions**, starting with the mutation-plus-activity pattern that every module repeats. The open question is where the boundary sits: inside each use case pulls a real database into every unit test, so the request seam is the better candidate.
2. **Ship the request logs somewhere queryable.** Several alerts in `docs/operations/alerting.md` are defined but cannot be wired until this exists, so it blocks more than its own row.
3. **Put timeouts on the remaining outbound calls.** The readiness probe is the only bounded one today; the mailer, storage, and auth provider can still hang.
4. **Fill the Owner column** in `docs/operations/alerting.md` and run the first restore drill. Both are the team's to do rather than the code's, and both close a row that is otherwise written and waiting.
