---
name: ts-conventions
description: Apply this project's TypeScript conventions — load this BEFORE writing or editing any .ts/.tsx file in this repo, including a one-line change, and re-check it before calling the work done. Covers arrow functions only (no `function` keyword except generators), no plain strings (user-facing copy in @app/messages, domain keys in shared const objects), 200-line file limit, logic/UI separation, T/I/E naming prefixes, ts-pattern for conditionals, ts-belt for arrays/objects, Effect for apps/api business logic, and explicit return types everywhere.
---

# TypeScript conventions

Non-negotiable rules for every `.ts`/`.tsx` file written or edited in this project.

Read the whole file before writing code, and run through it again before calling the work done — the rule most often missed on the second pass is **no plain strings**, immediately below.

## Arrow functions only

Every function is an arrow function assigned to a `const`. The `function` keyword is not used — not for React components, not for route pages, not for default-exported helpers.

```ts
const HealthPage = (): ReactElement => { ... };

const globalSetup = async (): Promise<void> => { ... };
export default globalSetup;
```

**The one exception is generators**, and it is a language limit rather than a style choice: an arrow function cannot be a generator. Effect's idioms therefore keep the keyword, and converting them is an error:

```ts
export const noteCreate = Effect.fn("noteCreate")(function* (input) { ... });
const program = Effect.gen(function* () { ... });
```

The shadcn/ui primitives in `packages/components/src/ui/` follow this rule too, so they differ from what `shadcn add` emits upstream — convert any newly added component by hand before committing it.

## No plain strings

Every string that carries meaning is named by a shared constant and referenced from there. A literal typed directly into a file is a bug waiting for the day someone changes it in three places out of four.

Two categories, two homes:

**User-facing copy** — labels, status text, error messages, empty states, button text — lives in `@app/messages`, one `SCREAMING_SNAKE` const object per feature in `packages/messages/src/<feature>/message.ts`, declared `as const` and re-exported from the package index.

```ts
export const HEALTH_MESSAGE = {
	STATUS: "Status",
	STATUS_OK: "Ok",
} as const;
```

Components and hooks import the constant. They never contain the sentence itself.

**Domain keys and enum-like values** — statuses, role keys, permissions, `Context.Service` tag ids, env keys, queue names — live in a shared const object near their domain, with the union type derived from it:

```ts
export const HEALTH_STATUS = { OK: "ok", READY: "ready" } as const;
export type THealthStatus = (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
```

Reference the constant at **every** call site, including the places that look too small to matter and are exactly where literals survive:

```ts
z.literal(HEALTH_STATUS.OK)                          // not z.literal("ok")
match(status).with(HEALTH_STATUS.OK, () => ...)      // not .with("ok", ...)
{ status: HEALTH_STATUS.OK }                         // not { status: "ok" as const }
```

That last set matters because TypeScript does not protect you here: rename the value and a stale `.with("ok", ...)` arm still compiles, silently never matching.

**Exempt:** Tailwind class strings inside `className`, and route paths handled by the router's own typed API. Those are styling and framework syntax, not named values — constant-ising them makes the code worse.

## File size

200 lines max per file. Split by responsibility — one use case, one component, one repository per file — not by mechanically chopping a large file in half.

## Separate logic from UI

Components render. Nothing else.

- Data fetching, mutations, derived state, and business logic live in a hook or use-case file, never inline in JSX.
- A route's `_components/*.tsx` renders; its `_hooks/*.ts` owns the data.

```
note-list.tsx      -> renders <ul>, no useQuery/useMutation calls
use-notes.ts        -> useNoteList(), useNoteCreate(), useNoteDelete()
```

## No comments

Code has to read clearly enough that a comment adds nothing. Rename the variable, extract the function, or restructure the condition instead of explaining it.

- No `//` or `/* */` explaining what code does.
- No JSDoc restating a signature that's already typed.
- If something genuinely needs documenting (a non-obvious external constraint, a workaround), it belongs in the PR description or a README, not the source file.

## Naming prefixes

- `T` for anything declared with `type` — `TNote`, `TCreateNoteInput`, `TNoteRepo`, `TSession`, `TDbService` (the plain shape behind a `Context.Service`, see below). An object-shaped `type` alias is still a `type`, so it gets `T`, never `I`.
- `I` only for a literal `interface` declaration — rare here; the one legitimate case is declaration-merging into a third-party module (`interface Register` for TanStack Router).
- `E` for enums, and for `Schema.TaggedError` classes — `EStatus`, `ERole`, `ENotFound`, `EDatabase`.

Every type alias, interface, enum, and tagged error carries its prefix. No exceptions, no unprefixed `Note`/`Status`/`Repo`/`NotFound` names.

## No inline object types on inputs

A parameter is never typed with an object literal (`input: { title: string; body: string }`). Input shapes come from the zod schemas in `@app/schemas` — `TNoteCreateInput`, `TNoteUpdateInput`, `TNoteListInput`, `TPagination` — and a repo/port signature takes exactly that inferred type. Don't hand-write a domain twin of a schema type (`TNoteQuery` duplicating `TNoteListInput`); import the schema type. Values that aren't part of the wire input (an actor id from the session) travel as a separate parameter, not merged into a new object type.

```ts
create: (input: TNoteCreateInput, authorId: string) => Effect.Effect<TNoteRow, EDatabase>;
update: (input: TNoteUpdateInput) => Effect.Effect<TNoteRow | null, EDatabase>;
```

Never inline a raw string where a shared constant already names that value — a role, a permission, a `Context.Service` tag id, an env key. Reference `ROLE.ADMIN`, `SERVICE_TAG.DB`, etc., not `"admin"`/`"app/DbService"` repeated at each call site.

## ts-pattern for conditionals

Replace `if`/`else` chains, `switch`, and nested ternaries with `match(...).with(...).exhaustive()` — use `.otherwise()` only when a fallback is intentional, never to paper over a missed case.

```ts
import { match } from "ts-pattern";

const label = match(status)
	.with("pending", () => "Pending")
	.with("done", () => "Done")
	.exhaustive();
```

A plain ternary for a single true/false branch is fine (`isLoading ? <Spinner /> : <Content />`); ts-pattern is for anything with more than one meaningful case.

**Exception — inside `Effect.gen`/`Effect.fn` bodies** (see below), error-raising control flow uses Effect's own idiom instead: a plain `if` guard that returns the failure, never `match`.

```ts
if (row === null) {
	return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
}
```

This is what forcing ts-pattern here would fight: Effect's own style guide (shipped in the `effect` package as `AGENTS.md`/`CLAUDE.md`) requires exactly this shape so TypeScript can see the function won't continue past a raised error. Everywhere else — routers, hooks, components, oRPC middleware — ts-pattern stays the rule.

## Effect for apps/api business logic

`apps/api`'s domain/application/infrastructure layers are built on [Effect](https://effect.website) (`effect@rc`, v4) — not because it's trendy, but because it's the DI, error-typing, and composition mechanism for that layer. Read the actual guidance shipped with the installed package (`node_modules/effect/AGENTS.md` and `ai-docs/`) before writing Effect code — it reflects the exact installed API, not general Effect knowledge, which drifts fast across major versions.

- **Errors** are `Schema.TaggedError` classes, not thrown exceptions — `application/shared/errors.ts` (`ENotFound`, `EForbidden`, `EDatabase`, ...). A use case fails with `return yield* new EError({...})`, never `throw`.
- **Services** are `Context.Service` classes — `class NoteRepo extends Context.Service<NoteRepo, TNoteRepo>()(SERVICE_TAG.NOTE_REPO) { static readonly layer = Layer.effect(...) }`. This is Effect v4's *only* way to declare a DI key (the older `Context.Tag`/`GenericTag` split doesn't exist in v4 — verified against the installed package, not assumed) — the class **is** the runtime lookup token, so it can't be avoided. What can, and must, stay functional: the service's shape is always a separately named `type TXxx = {...}` (an ordinary T-prefixed type alias, not inlined into the class; suffix `Shape` when a same-named `T` type already exists, as in `TAuthServiceShape`/`TActivityRepoShape`), and the tag id string always comes from the shared `SERVICE_TAG` constant, never a literal.
- **Use cases** are `Effect.fn("name")(function* (input) {...})` programs that pull dependencies with `yield* SomeService` — never a hand-rolled `makeXxx(deps) => (input) => ...` DI pattern; Effect's own context resolution replaces that entirely.
- **The oRPC boundary** (`presentation/orpc/run-effect.ts`) is the only place an Effect program is run and crosses back into Promise-land — it catches every expected tagged error into a plain value *before* `runPromise` (so only real defects can reject the promise), then maps by `_tag` to an `ORPCError`.
- Third-party Promise-based APIs that aren't Effect-aware (better-auth's `databaseHooks`, a callback-based queue consumer) are left as plain async functions at that exact seam — wrap them in `Effect.tryPromise` on the Effect side rather than forcing the whole third-party surface through Effect.
- Everything outside `apps/api`'s business-logic layers (React components/hooks, oRPC/Hono framework wiring, scripts) stays plain Promise/async-await — Effect isn't a repo-wide requirement, it's scoped to where it's actually doing DI/error-typing work.

## ts-belt for arrays and objects

Use `@mobily/ts-belt`'s `A` (array) and `D` (dict/object) modules instead of native `Array.prototype`/`Object.*` methods.

```ts
import { A, D } from "@mobily/ts-belt";

const titles = A.map(notes, (note) => note.title);
const found = A.find(notes, (note) => note.id === id);
const patched = D.merge(note, { title: "Updated" });
```

Native syntax is fine only where ts-belt has no equivalent — object/array literals, spread, destructuring.

## Explicit return types

Every function, arrow function, and method declares its return type. Never rely on inference — not for one-liners, not for anything exported, not for anything with a single return path.

```ts
const toLabel = (status: TStatus): string =>
	match(status)
		.with("pending", () => "Pending")
		.with("done", () => "Done")
		.exhaustive();
```
