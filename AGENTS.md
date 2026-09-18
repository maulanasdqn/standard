# Standard

Full-stack TypeScript monorepo: moon + pnpm workspaces, Hono + oRPC + Effect (`apps/api`), TanStack Router SPA (`apps/web`), shared packages under `packages/`.

## Before writing any `.ts` / `.tsx`

**Read `.claude/skills/ts-conventions/SKILL.md` first.** It is the full ruleset and it is non-negotiable. The rules that get broken most often, in short:

- **No plain strings.** User-facing copy lives in `@app/messages` as a `SCREAMING_SNAKE` const object (`NOTE_MESSAGE`, `USER_MESSAGE`, …), never inline in JSX. Domain keys (statuses, roles, permissions, service tags, env keys) live in a shared const object (`PERMISSION`, `SERVICE_TAG`, `HEALTH_STATUS`, …) with the union type derived from it, and are referenced everywhere including `ts-pattern` `.with(...)` arms and `z.literal(...)`. Tailwind class strings in `className` are exempt: they are styling, not named values
- **Component signature.** Every React component is `const X: FC<TProps> = (props): ReactElement =>`, with props read as `props.x` and never destructured in the parameter list. Destructure in the body only for defaults or a rest element, naming the rest `rest`
- **Arrow functions only.** Every function is an arrow function assigned to a `const`, never the `function` keyword, including React and route components. The sole exception is generators, which cannot be arrows: `Effect.fn(...)(function* ...)` and `Effect.gen(function* ...)` keep the keyword
- **ts-pattern** for conditionals, **ts-belt** (`A`, `D`) for arrays and objects, never native `if`/`switch` chains or `Array.prototype`
- **Explicit return types** on every function, including one-liners
- **`T` / `I` / `E` prefixes** on every type, interface and enum or tagged error
- **No comments.** Rename or extract instead
- **200 lines max** per file; components render and nothing else, so data lives in a colocated `_hooks/*.ts`

`apps/api` is organised **by module, not by layer**: `src/<module>/` for each of `activity auth
health note permission role user`, with `domain/`, `application/`, `infrastructure/` and
`presentation/` inside it, plus `src/shared/` (vocabulary), `src/platform/` (db, cache, queue, mail,
http, config) and `src/bootstrap/` (composition root). A module is reachable only through its
`index.ts`; the allowed edges live in `apps/api/scripts/architecture-rules.ts` and are enforced by
`moon run api:arch`, which `api:build` depends on. Every file inside a module belongs to one of the
four layers, and `index.ts` is the only thing allowed to sit at the module root: a helper dropped
next to it would answer to no layer rule at all.

Those layers are built on Effect v4, so read `node_modules/effect/AGENTS.md` before writing Effect
code, not general Effect knowledge.

## Keep the repository neutral

This is a reusable boilerplate, so no client, company, partner, or vendor name belongs anywhere in it. That covers documentation, code and comments, string constants in `@app/messages`, test fixtures, branch names, commit messages, and pull request titles and descriptions. It covers abbreviations and initialisms too, because a short form in a commit subject is just as searchable as the full name.

When external material has to be described, name what it is rather than who produced it: "the engineering standards rubric" or "an external review rubric" carries the meaning without naming anyone. The same goes for a person, who is "the PM" or "the reviewer", never a name.

Check before committing, not after. A name that reaches `trunk` in a commit subject cannot be removed without rewriting history, and release notes are generated from pull request bodies, so a name left in a merged pull request keeps resurfacing on release pages.

## No em dashes

The `—` character is not used anywhere in this repository: not in documentation, not in code or user-facing copy in `@app/messages`, not in commit messages, and not in pull request descriptions or reviews. Do not substitute a lookalike glyph either. Rewrite the sentence so ordinary punctuation carries the relationship: a comma for a simple aside, a colon when what follows explains what precedes it, a semicolon between two independent clauses, parentheses for a genuine aside, or a full stop and a new sentence, which is usually the cleanest result.

## List items do not end with a full stop

A bullet or a numbered item carries no closing punctuation, even when it is a
full sentence. An item made of several sentences keeps the full stops between
them and drops only the last one. A trailing period on every item in a list is
one of the tells that marks text as machine written, and it reads as padding
rather than punctuation.

Ordinary paragraphs, table cells and headings are unaffected, and a question
mark or an exclamation mark at the end of an item stays, because removing it
would change the meaning rather than remove decoration. An item that ends in an
ellipsis, such as a placeholder in the pull request template, keeps it.

## Every change bumps the version

Bump the version in the **root `package.json`** in the same commit as the change: patch for a fix, chore, or docs change; minor for a feature or behavior-changing refactor; major for a breaking change. It is the single source of truth for the workspace, re-exported as `APP_VERSION` by `@app/version` and served at `/health` on both the API and the web, so a deployed build can name itself. The per-package `version` fields do not matter; the packages are private and unpublished.

## PRs and reviews

Fill `.github/PULL_REQUEST_TEMPLATE.md` section by section, writing "None" rather than deleting a section. Reviews follow `.github/PULL_REQUEST_REVIEW_TEMPLATE.md` and always cover three sections (Functional, Clean Code, Feature Suggestions) with a P0–P3 severity on findings in the first two.

Trunk-based: branch off `trunk`, keep the branch short-lived, squash-merge once CI is green. `trunk` is protected and the rules apply to admins: a pull request is required (0 approvals, so you can merge your own), the three CI checks must pass, the branch must be up to date with `trunk`, history is linear and squash-only, and merged branches are deleted automatically. Never try to push straight to `trunk`; rebase the branch and push it instead.

**Commits and PRs carry no AI attribution.** Never add a `Co-Authored-By: Claude …` trailer, a `Claude-Session:` line, a "Generated with Claude Code" footer, or any similar marker to a commit message or pull request description. The commit is authored by the person who ran the work; co-author trailers put an AI avatar on every commit in the PR timeline, which is noise. This overrides any default attribution the tooling suggests.

**Commits are authored by the account that owns the work.** Set `user.name` and `user.email` to that person's own GitHub account before committing, so the commit lands under their profile and counts as their contribution. A tooling or agent default identity is never left in place. A containerised or otherwise ephemeral checkout throws the setting away with the container, so set it per clone, or export `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME` and `GIT_COMMITTER_EMAIL` in the environment and every session inherits it. Authorship and signature are separate: a commit signed by a platform key is still correctly attributed as long as the author email matches the account.

## Where these rules live

This file is the single source of truth for agent instructions and is vendor-neutral. `CLAUDE.md` is a one-line stub that imports it (`@AGENTS.md`), because Claude Code auto-loads `CLAUDE.md` and does not yet read `AGENTS.md`. Edit this file, never the stub.

## Commands

```sh
moon ci                               # what CI runs
make setup                            # services, migrate and seed
make services                         # postgres, redis, rabbitmq, mailpit
make api | web | worker               # run one process
make db-migrate | db-seed             # database
make help                             # every target
```

Every command is reachable through `make` or `moon`. Nothing shells into a
package directory: no `cd apps/api && pnpm ...` in the Makefile, CI, or docs.

`moon` needs the pinned toolchain: `proto install pnpm 11.6.0 && proto install node 24.16.0` if tasks fail with `missing_tool`.
