# Standard

A single-app boilerplate: **moon + pnpm workspaces · Hono + oRPC (RPC and REST from one router) · Effect (business logic, DI, error handling) · Drizzle · better-auth · Redis + RabbitMQ · React 19 + TanStack Router (foldered file-based routes) + Vite + Tailwind v4 · Biome · Vitest · Playwright**.

Distilled from a larger production monorepo — same layering and conventions, scoped to one app so it's a starting point rather than a template you have to strip down.

## Stack

| Concern | Choice |
|---|---|
| Monorepo | [moon](https://moonrepo.dev) + pnpm workspaces |
| API | Hono host, business logic in [oRPC](https://orpc.unnoq.com) procedures — served as typed RPC **and** plain REST + OpenAPI from the same router |
| Business logic | [Effect](https://effect.website) (`effect@rc`, v4) — use cases as `Effect.fn` programs, dependencies as `Context.Service` + `Layer`, errors as `Schema.TaggedError` |
| DB | Drizzle ORM + Postgres |
| Auth | [better-auth](https://better-auth.com), role stored on `user.role` |
| Jobs | RabbitMQ (queue) + Redis (cache), separate worker entrypoint |
| Web | React 19, TanStack Router (SPA, file-based) + Query + Form + Table + Store, Vite, Tailwind v4 |
| Lint/format | [Biome](https://biomejs.dev) |
| Tests | Vitest (unit/integration), Playwright (web e2e) |
| Code style | [ts-pattern](https://github.com/gvergnaud/ts-pattern) for conditionals, [@mobily/ts-belt](https://github.com/mobily/ts-belt) for arrays/objects — see `.claude/skills/ts-conventions/SKILL.md` (inside `Effect.gen`/`Effect.fn` bodies, error-raising control flow uses Effect's own `if (...) { return yield* new EError({...}) }` idiom instead, per Effect's own style guide) |

## Layout

```
apps/
  api/          Hono + oRPC + Drizzle — domain / application / infrastructure / presentation / worker
  api-e2e/      Vitest against a real running API + throwaway Postgres db
  web/          TanStack Router SPA
  web-e2e/      Playwright against the built web app + a real API
packages/
  schemas/      Zod source of truth shared by api + web
  permissions/  PERMISSION constants, role→permission map, canAll/canAny
  core/         RabbitMQ queue helper, transactional outbox, activity log
  logger/       pino factory
  format/       date/money/string formatters
  messages/     user-facing message constants
  migrations/   shared runMigrations() used by apps/api/src/infrastructure/db/migrate.ts
  components/   shadcn-style UI primitives + permission Guard + route-guard + theme.css
```

Packages and the api export **raw TypeScript source** (e.g. `"exports": { ".": "./src/index.ts" }`; the api's public surface lives at `src/bootstrap/index.ts`) — no build step; `build` is just `tsc --noEmit`. Everything is wired through moon tasks; run `moon run <project>:<task>` or the root `pnpm <script>` (which fans out via `moon run :<task>`).

### API layering

```
domain/          entities + port interfaces (Effect-returning: Effect<A, EDatabase>, etc.) — no framework imports
application/     use cases as Effect.fn programs — depend on services via yield*, not manual DI
infrastructure/  Context.Service classes + their Layer: db (Drizzle), auth (better-auth), cache (Redis), queue (RabbitMQ)
presentation/    orpc/ (context, middleware, error-mapping, run-effect — the Effect↔Promise bridge), routers/, http/ (Hono mounts)
worker/          RabbitMQ job handlers + outbox drain
bootstrap/       compose.ts (AppLayer + ManagedRuntime), polyfill.ts, index.ts (public exports)
main.ts          the only file at src/ root — the HTTP entrypoint
```

`presentation/http/mount-orpc.ts` mounts the **same** oRPC router twice: `RPCHandler` at `/rpc` for the typed client used by the web app, and `OpenAPIHandler` at `/api` for conventional REST — with a browsable OpenAPI reference at `/api`.

### Effect: services, errors, and the oRPC bridge

- **Errors** (`application/shared/errors.ts`) are `Schema.TaggedError` classes (`ENotFound`, `EForbidden`, `EUnauthorized`, `EDatabase`, `EAuth`, `EQueue`) — a use case fails by `return yield* new ENotFound({ message })`, never by throwing.
- **Services** are `Context.Service` classes that carry their own `static readonly layer` — e.g. `NoteRepo` (`infrastructure/db/repositories/note-repository.ts`) wraps Drizzle calls in `Effect.tryPromise`, mapping failures to `EDatabase`. A service that needs another service builds its layer with `.pipe(Layer.provide(OtherService.layer))`.
- **`bootstrap/compose.ts`** merges every service layer into one `AppLayer` and builds a single `ManagedRuntime` (with a shared `memoMap`, so a service used by two other layers — e.g. `DbService` under both `NoteRepo` and `AuthService` — is only constructed once).
- **`presentation/orpc/run-effect.ts`** is the only place Effect programs cross into oRPC's Promise world: it runs an effect on the shared runtime, catches every `TDomainError` into a plain success value first (never lets `runPromise` reject on an *expected* failure — only real defects propagate), then maps the caught error to an `ORPCError` by `_tag`.
- Third-party Promise-based APIs that aren't Effect-aware (better-auth's `databaseHooks`, `@app/core`'s `TActivityRepo`/`TJobHandler`) are left as plain async functions at that seam — a Context.Service wraps them in `Effect.tryPromise` for the Effect side, rather than forcing the whole third-party surface through Effect.

### Web route colocation

Routes live in `src/routes/`, generated by the TanStack Router plugin. Underscore-prefixed folders (`_components`, `_hooks`, `_constants`, `_utils`) are colocated code, excluded from route generation:

```
routes/_authenticated/notes/
  index.tsx           the page
  _components/        NoteList, CreateNoteForm
  _hooks/              use-notes.ts (query/mutation hooks)
  _constants/          search.ts (Zod search-param schema)
```

URL search params are the source of truth for list state (`validateSearch`); permission checks live in `beforeLoad: checkRoutePermissions({ permissions: [...] })` from `@app/components/guard/route-guard`.

### Client state — TanStack Store

`sessionStore` (`src/libs/auth/session-store.ts`) is the single source of truth for the signed-in session — set via `setSession`/`refreshSession`, read via the `useSession()` hook. `permissionsStore` (`@app/components/guard/permissions-store`) stays in sync as a side effect of `setSession`, so `Guard`, `checkRoutePermissions`, and any `useSession()` consumer update together. `main.tsx` subscribes the store to the router (`router.update` + `router.invalidate`) so login/sign-out re-run route guards reactively — no full-page reloads.

### Forms — TanStack Form

Every form (`login-form.tsx`, `create-note-form.tsx`) is built on `@tanstack/react-form`, validated by the same Zod schema used at the API boundary (`loginInputSchema`, `createNoteInputSchema` from `@app/schemas`) — one schema, client and server. The form's logic lives in a colocated `_hooks/use-*-form.ts` (defaultValues, validators, `onSubmit`); the component only renders `form.Field`/`form.Subscribe`. Per-field errors render through the shared `FieldError` component (`@app/components/ui/field-error`).

## Getting started

Requires [moon](https://moonrepo.dev/docs/install) and [proto](https://moonrepo.dev/proto) (or Node 24.16.0 / pnpm 11.6.0 installed directly) — not yet installed in this environment; `.prototools` pins the versions.

```sh
make setup                          # docker services (postgres, redis, rabbitmq) + .env + pnpm install
cd apps/api && pnpm db:migrate && pnpm db:seed
moon run api:dev                    # api on :3001
moon run web:dev                    # spa on :5173
```

Seeded login: `admin@app.test` / `admin-password-123`.

## Adding a feature end-to-end

Using the `note` resource as the template:

1. **Schema** — add input/output Zod schemas to `packages/schemas/src/<feature>/`
2. **Domain** — add the row type + an Effect-returning repo port (`Effect.Effect<A, EDatabase>`) to `apps/api/src/domain/<feature>/`
3. **Infrastructure** — add the Drizzle table to `apps/api/src/infrastructure/db/schema/`, then a `Context.Service` implementing the port under `db/repositories/` (wrap each Drizzle call in `Effect.tryPromise`, mapping failures to `EDatabase`); run `pnpm db:generate` to create the migration
4. **Application** — add one `Effect.fn("name")(function* (input) {...})` use case per operation under `apps/api/src/application/<feature>/`, pulling its dependencies with `yield* SomeRepo`
5. **Wire it into `bootstrap/compose.ts`** — add the new repo's `.layer` to `AppLayer`
6. **Presentation** — add oRPC procedures in `apps/api/src/presentation/routers/<feature>.ts` calling `runEffect(useCase(input))`, gated with `requirePermission(...)`; register in `routers/index.ts`
7. **Permissions** — add any new `PERMISSION.*` constants and extend `ROLE_PERMISSIONS` in `packages/permissions`
8. **Web** — add the route under `apps/web/src/routes/_authenticated/<feature>/` with colocated `_components`/`_hooks`, calling the feature through `orpc.<feature>.*` from `src/libs/orpc/client.ts`

## Commands

```sh
make check | lint | format | test | build    # moon run :task across the workspace
moon run api:db-generate                     # drizzle-kit generate
moon run api:worker                          # run the RabbitMQ worker locally
```

The e2e suites (`api-e2e`, `web-e2e`) are **not** run in CI (`runInCI: false`) — they spin up a real API against a throwaway Postgres database and are meant as a local pre-PR gate:

```sh
cd apps/api-e2e && pnpm e2e:local
cd apps/web-e2e && pnpm e2e:local
```

## CI

`.github/workflows/ci.yml` runs `moon ci` (affected projects only) on every PR and push to `main`, plus a **drizzle drift** job that regenerates migrations and fails the build if the committed SQL is out of date with the schema.
