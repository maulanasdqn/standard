---
name: ts-conventions
description: Apply this project's TypeScript conventions when writing or editing any .ts/.tsx file — file size limit, logic/UI separation, T/I/E naming prefixes, ts-pattern for conditionals, ts-belt for arrays/objects, Effect for apps/api business logic, and explicit return types everywhere.
---

# TypeScript conventions

Non-negotiable rules for every `.ts`/`.tsx` file written or edited in this project.

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

- `T` for type aliases — `TNote`, `TCreateNoteInput`, `TQueueConnection`.
- `I` for interfaces — `INoteRepo`, `ISession`, `IDbService` (the plain shape behind a `Context.Service`, see below).
- `E` for enums, and for `Schema.TaggedError` classes — `EStatus`, `ERole`, `ENotFound`, `EDatabase`.

Every type alias, interface, enum, and tagged error carries its prefix. No exceptions, no unprefixed `Note`/`Status`/`Repo`/`NotFound` names.

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
- **Services** are `Context.Service` classes — `class NoteRepo extends Context.Service<NoteRepo, INoteRepo>()(SERVICE_TAG.NOTE_REPO) { static readonly layer = Layer.effect(...) }`. This is Effect v4's *only* way to declare a DI key (the older `Context.Tag`/`GenericTag` split doesn't exist in v4 — verified against the installed package, not assumed) — the class **is** the runtime lookup token, so it can't be avoided. What can, and must, stay functional: the service's shape is always a separately named `type IXxx = {...}` (an ordinary I-prefixed interface, not inlined into the class), and the tag id string always comes from the shared `SERVICE_TAG` constant, never a literal.
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
