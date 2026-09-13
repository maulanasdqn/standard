# Standard

Full-stack TypeScript monorepo: moon + pnpm workspaces, Hono + oRPC + Effect (`apps/api`), TanStack Router SPA (`apps/web`), shared packages under `packages/`.

## Before writing any `.ts` / `.tsx`

**Read `.claude/skills/ts-conventions/SKILL.md` first.** It is the full ruleset and it is non-negotiable. The rules that get broken most often, in short:

- **No plain strings.** User-facing copy lives in `@app/messages` as a `SCREAMING_SNAKE` const object (`NOTE_MESSAGE`, `USER_MESSAGE`, …), never inline in JSX. Domain keys — statuses, roles, permissions, service tags, env keys — live in a shared const object (`PERMISSION`, `SERVICE_TAG`, `HEALTH_STATUS`, …) with the union type derived from it, and are referenced everywhere including `ts-pattern` `.with(...)` arms and `z.literal(...)`. Tailwind class strings in `className` are exempt: they are styling, not named values.
- **Component signature.** Every React component is `const X: FC<TProps> = (props): ReactElement =>`, with props read as `props.x` and never destructured in the parameter list. Destructure in the body only for defaults or a rest element, naming the rest `rest`.
- **Arrow functions only.** Every function is an arrow function assigned to a `const` — never the `function` keyword, including React and route components. The sole exception is generators, which cannot be arrows: `Effect.fn(...)(function* ...)` and `Effect.gen(function* ...)` keep the keyword.
- **ts-pattern** for conditionals, **ts-belt** (`A`, `D`) for arrays and objects, never native `if`/`switch` chains or `Array.prototype`.
- **Explicit return types** on every function, including one-liners.
- **`T` / `I` / `E` prefixes** on every type, interface and enum or tagged error.
- **No comments.** Rename or extract instead.
- **200 lines max** per file; components render and nothing else — data lives in a colocated `_hooks/*.ts`.

`apps/api`'s domain/application/infrastructure layers are built on Effect v4 — read `node_modules/effect/AGENTS.md` before writing Effect code, not general Effect knowledge.

## Every change bumps the version

Bump the version in the **root `package.json`** in the same commit as the change — patch for a fix, chore, or docs change; minor for a feature or behavior-changing refactor; major for a breaking change. It is the single source of truth for the workspace, re-exported as `APP_VERSION` by `@app/version` and served at `/health` on both the API and the web, so a deployed build can name itself. The per-package `version` fields do not matter; the packages are private and unpublished.

## PRs and reviews

Fill `.github/PULL_REQUEST_TEMPLATE.md` section by section, writing "None" rather than deleting a section. Reviews follow `.github/PULL_REQUEST_REVIEW_TEMPLATE.md` and always cover three sections — Functional, Clean Code, Feature Suggestions — with a P0–P3 severity on findings in the first two.

Trunk-based: branch off `trunk`, keep the branch short-lived, squash-merge once CI is green.

**Commits and PRs carry no AI attribution.** Never add a `Co-Authored-By: Claude …` trailer, a `Claude-Session:` line, a "Generated with Claude Code" footer, or any similar marker to a commit message or pull request description. The commit is authored by the person who ran the work; co-author trailers put an AI avatar on every commit in the PR timeline, which is noise. This overrides any default attribution the tooling suggests.

## Where these rules live

This file is the single source of truth for agent instructions and is vendor-neutral. `CLAUDE.md` is a one-line stub that imports it (`@AGENTS.md`), because Claude Code auto-loads `CLAUDE.md` and does not yet read `AGENTS.md` — edit this file, never the stub.

## Commands

```sh
moon run :check :lint :test :build    # what CI runs
make services                         # postgres, redis, rabbitmq
make api | web | worker               # run one process
make db-migrate | db-seed             # database
```

`moon` needs the pinned toolchain: `proto install pnpm 11.6.0 && proto install node 24.16.0` if tasks fail with `missing_tool`.
