---
title: Add a module to the API and the app
description: Copy the notes module, register it in five places, and give it a table, a page and its own browser tests without missing a touchpoint.
publishedAt: 2026-10-21
tags:
  - modules
  - testing
---

The API is organised by module rather than by layer, so a new capability is a new directory under `apps/api/src/`, not a new file in a shared one. `note` is the reference module: it is the smallest one that reaches every touchpoint, so keep it open beside you. The full checklist lives in `docs/adding-a-module.md`; this guide follows it in the order you will meet it.

## Lay out the module

A module has four layers and one entry point:

| Path | Holds |
|---|---|
| `domain/<module>.ts` | The row type and the port type, with no Effect program |
| `application/<module>-<use-case>.ts` | One use case per file, each an `Effect.fn` program with its own test beside it |
| `infrastructure/<module>-repository.ts` | The Drizzle implementation and its layer |
| `presentation/<module>-router.ts` | The oRPC handlers, each guarded by a permission |
| `index.ts` | The only file other code may import |

`moon run api:arch` enforces those boundaries, and `api:build` depends on it, so an import that crosses a layer it should not fails the build rather than the review.

## Register it in five places

A module that is written but not registered compiles and does nothing. Each of these edits is required:

1. `packages/contract/src/<module>.ts`: declare every procedure with its input and output, and add it to `appContract`, because the web client is typed from it
2. `apps/api/scripts/architecture-rules.ts`: add the module to `MODULE` and give it an entry in `MODULE_MAY_IMPORT`, where an empty list is the right default
3. `apps/api/src/bootstrap/compose.ts`: add the module's layer to the composition
4. `apps/api/src/bootstrap/router.ts`: add its router, so a contract key with no handler is a type error
5. `apps/api/src/shared/repo-tags.ts`: add the repository tag id as a constant

Forgetting step 2 is caught for you: the architecture check fails on a module the rules do not list.

## Add its vocabulary to the shared packages

The wire shape, the copy and the permissions each have one home:

- `@app/schemas` holds the zod input and output schemas, which the contract and the web both import
- `@app/messages` holds every user-facing string, as one constant object per module
- `@app/permissions` holds the permission keys, written `<resource>:<action>`, and the roles that grant them
- `@app/activity` holds the activity actions, written `<resource>.<action>`, so the activity log can record the module

## Create the table

The table lives in `apps/api/src/platform/db/tables/<module>.ts` and is re-exported from `db/schema.ts`. Generate the migration instead of writing SQL by hand:

```sh
make db-generate
```

Before you change a column that already exists, read the expand and contract rules in `docs/operations/deployment.md`. Migrations run before the new code rolls out, so the schema has to keep working for the code that is still running.

## Add the page

A feature in the app is a route directory under `apps/web/src/routes/_authenticated/<module>/`. The route file renders, `_components/` holds the presentation, and `_hooks/` holds every query, mutation and piece of form state; a component that fetches its own data is a review finding. Two registries put the module in the shell: its entry in `NAV_GROUPS` in `_constants/nav.ts`, and, if you want one, a dashboard card in `dashboard/_constants/widgets.ts`.

## Test it in the browser

Browser tests for a module live in their own folder, `apps/web-e2e/tests/<module>/`. The specs outside those folders cover the shell and the account features only, so deleting a module later means deleting its folder. Run the whole suite the way CI does:

```sh
make e2e
```

If you are building on Standard and do not want notes, remove `tests/notes/` together with the module itself.
