# Standard

Standard is a full-stack TypeScript monorepo. It has these parts:

- moon + pnpm workspaces
- `apps/api`: Hono + oRPC + Effect
- `apps/web`: a TanStack Router SPA under `/app`
- `apps/landing`: a static Astro landing page at `/`
- `packages/`: shared packages

## Read this before you write

| Before you change | Read |
|---|---|
| A `.ts` or `.tsx` file, also for a one-line change | `.claude/skills/ts-conventions/SKILL.md`. It has all the rules, and you must obey all of them |
| Effect code in `apps/api` | First `node_modules/effect/AGENTS.md`. It shows the installed v4 API, not general Effect knowledge. Then `docs/effect-services.md`. It tells why this repository makes services in this shape |
| A new module, endpoint, table or permission | `docs/adding-a-module.md`. It shows all the files to change, also the files that a directory list does not show |
| A screen, component or user-facing text in `apps/web` or `apps/landing` | `docs/ui-guidelines.md`. It shows the loading state for each type of wait. It also has the rule to use only the necessary text: use a UI element or an ⓘ tooltip, not a sentence |
| A blog article | `docs/blog.md`. Then run `moon run landing:new-post -- "<title>"`. This command starts the draft and shows the writing prompt |
| A task to run or operate the stack | `README.md` to run it locally. `docs/operations/` for all other tasks |

### Structure of `apps/api`

`apps/api` has one directory for each module. It does not have one directory for each layer:

- `src/<module>/` for each of these modules: `activity auth health newsletter note permission role user`. Each module has the directories `domain/`, `application/`, `infrastructure/` and `presentation/`
- `src/shared/` for the shared vocabulary
- `src/platform/` for db, cache, queue, mail, http and config
- `src/bootstrap/` for the composition root

Other code can use a module only through the `index.ts` of the module. `apps/api/scripts/architecture-rules.ts` gives the permitted dependencies. `moon run api:arch` makes sure that the code obeys these rules, and `api:build` runs it.

Each file in a module must be in one of the four layers. Only `index.ts` can be at the root of a module. If you put a helper file next to `index.ts`, no layer rule applies to it.

### `apps/landing`

`apps/landing` is a static Astro site. Its text is in `@app/messages`, the same as the text of all other apps.

The API serves the landing site with a Content-Security-Policy. This policy permits scripts and styles from the origin only. Thus, a page must not have an inline script, a `<style>` element or a `style` attribute. If a page has one of these, the landing tests make the build fail.

## Package layers

Each project has one moon tag. `constraints.tagRelationships` in `.moon/workspace.yml` sets the permitted dependency direction between the tags:

| Tag | Projects | Can depend on |
|---|---|---|
| `infra` | cache, queue, logger, metrics, tracing, migrations, mail, storage, format, grpc, version | `infra` only |
| `identity` | permissions, activity, messages, schemas, components | `identity` and `infra` |
| `app` | All directories under `apps/` | `app`, `identity` and `infra` |

If a package must have user-facing text, keep that text in the source of the package. Do not import `@app/messages`. That import adds the identity vocabulary to the infrastructure layer.

moon reads the dependencies from each `package.json`. Thus, you do not have to write `dependsOn` entries. If a dependency goes in the incorrect direction, moon does not build the project graph. Thus, the first `moon run` fails, before a review sees the problem.

A tag can always depend on itself. A tag with an empty list has no limits. For this reason, `infra` has itself in its list.

## Keep the repository neutral

This repository is a boilerplate for many projects. Thus, it must not contain the name of a client, company, partner or vendor. This rule applies to:

- Documentation
- Code and comments
- String constants in `@app/messages`
- Test fixtures
- Branch names
- Commit messages
- Pull request titles and descriptions

The rule also applies to abbreviations and initialisms. A person can find a short name in a commit subject as easily as a full name.

If you must refer to external material, tell what it is. Do not tell who made it. For example, write "the engineering standards rubric" or "an external review rubric". Do the same for persons. Write "the PM" or "the reviewer". Do not write a name.

Do this check before you commit. If a name gets into a commit subject on `trunk`, you can remove it only if you change the history. The release notes come from the pull request descriptions. Thus, a name in a merged pull request shows again on each release page.

## No em dashes

Do not use the `—` character in this repository. This rule applies to documentation, code, user-facing text in `@app/messages`, commit messages, pull request descriptions and reviews. Do not use a character that looks the same.

Write the sentence again and use usual punctuation:

- A comma for a short added phrase
- A colon when the text after it explains the text before it
- A semicolon between two independent clauses
- Parentheses for a true aside
- A full stop and a new sentence. This is usually the best result

## List items do not end with a full stop

A bullet item or a numbered item does not have a full stop at the end. This rule applies also when the item is a full sentence. If an item has more than one sentence, keep the full stops between the sentences. Remove only the last full stop.

A full stop at the end of each list item is a sign of machine-written text. It is padding, not punctuation.

This rule does not apply to usual paragraphs, table cells or headings. Keep a question mark or an exclamation mark at the end of an item, because these marks change the meaning. Keep an ellipsis at the end of an item, for example in a placeholder in the pull request template.

## Every change bumps the version

Increase the version in the **root `package.json`** in the same commit as the change. Use the correct increment:

- Patch: a fix, a chore or a documentation change
- Minor: a feature or a refactor that changes the behavior
- Major: a breaking change

The root version is the only source of the workspace version. `@app/version` exports it as `APP_VERSION`. The API shows it at `/api/health` and the web app shows it at `/app/health`. Thus, a deployed build can show its version.

The `version` fields in the packages are not important. The packages are private and are not published.

## PRs and reviews

Use `.github/PULL_REQUEST_TEMPLATE.md` for each pull request. Complete each section. If a section does not apply, write "None" in it. Do not delete a section. The Changelog section goes to the release page without changes. Thus, write it for the persons who read that page.

Use `.github/PULL_REQUEST_REVIEW_TEMPLATE.md` for each review. A review always has three sections: Functional, Clean Code and Feature Suggestions. Each finding in the first two sections has a P0-P3 severity.

The project uses trunk-based development:

1. Make a branch from `trunk`. Keep the branch short-lived
2. When CI passes, squash-merge the branch

Do not push directly to `trunk`. If a branch is behind `trunk`, rebase it and push it again. The table in `README.md` shows the protection rules and what they do.

**No record has AI attribution.** Do not add these items to a commit message, a pull request description or a review. Also do not add them to a review comment or an issue:

- A `Co-Authored-By: Claude …` trailer
- A `Claude-Session:` line
- A "Generated with Claude Code" or "Generated by Claude Code" footer
- A different marker of the same type

The release notes come from the pull request descriptions. Later changes are compared with the reviews. Thus, a marker in one of these records stays after the merge. The person who did the work is the author of the commit. A co-author trailer puts an AI avatar on each commit in the pull request timeline, and this is noise. This rule has priority over the default attribution of the tools.

**The account that owns the work is the author of the commit.** Before you commit, set `user.name` and `user.email` to the GitHub account of that person. Thus, the commit shows on the profile of that person and counts as their contribution. Do not keep the default identity of a tool or an agent.

A container or a different temporary checkout loses this setting when the container stops. Thus, set it for each clone. Alternatively, set `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME` and `GIT_COMMITTER_EMAIL` in the environment. Then each session gets these values.

The author and the signature are different items. A platform key can sign a commit. The attribution is correct if the author email is the same as the email of the account.

## Check the text and the code with ste

`ste` checks text and code with the rules of ASD-STE100 Simplified Technical English (STE). Run `make ste-install` to install the pinned version.

A check fails on an error. A warning does not stop it:

- `ste check prose README.md AGENTS.md` checks these two files with the STE writing rules. The other documents do not use STE at this time
- `ste check code apps packages` checks the code with the STE-C rules
- `ste check commit` checks each commit message. The lefthook `commit-msg` hook runs it

`make ste-check` runs the first two checks. The `pre-push` hook and CI also run it.

The hook does not see the squash commit that GitHub makes. Thus, write the title of a pull request with the same rules.

`.ste.json` gives the files that `ste` skips and the rules that it does not use. The C2.1 and C3.1 naming rules are off. They ask for a verb at the start of a name, but the names in this repository start with the resource, for example `noteCreate`.

## Commands

You can run all commands through `make` or `moon`. `make help` shows all targets. Do not run a command from a package directory. For example, do not write `cd apps/api && pnpm ...` in the Makefile, in CI or in the documentation.

CI runs `moon ci`. Thus, run `moon ci` before you push.

`moon` needs the pinned toolchain. If a task fails with `missing_tool`, run `proto install pnpm 11.6.0 && proto install node 24.22.1`.

## Where these rules live

This file is the only source of agent instructions. It does not apply to only one vendor.

`CLAUDE.md` has only one line, which imports this file (`@AGENTS.md`). Claude Code loads `CLAUDE.md` automatically, but it does not read `AGENTS.md` at this time. Edit this file. Do not edit `CLAUDE.md`.
