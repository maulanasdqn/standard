---
name: ts-conventions
description: Apply this project's TypeScript conventions when writing or editing any .ts/.tsx file — file size limit, logic/UI separation, T/I/E naming prefixes, ts-pattern for conditionals, ts-belt for arrays/objects, and explicit return types everywhere.
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
use-notes.ts        -> useNotes(), useCreateNote(), useDeleteNote()
```

## No comments

Code has to read clearly enough that a comment adds nothing. Rename the variable, extract the function, or restructure the condition instead of explaining it.

- No `//` or `/* */` explaining what code does.
- No JSDoc restating a signature that's already typed.
- If something genuinely needs documenting (a non-obvious external constraint, a workaround), it belongs in the PR description or a README, not the source file.

## Naming prefixes

- `T` for type aliases — `TNote`, `TCreateNoteInput`, `TUseCases`.
- `I` for interfaces — `INoteRepo`, `IDependencies`, `ISession`.
- `E` for enums — `EStatus`, `ERole`.

Every type alias, interface, and enum carries its prefix. No exceptions, no unprefixed `Note`/`Status`/`Repo` type names.

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
