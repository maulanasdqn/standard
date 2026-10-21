# {PRODUCT} blog article prompt

You are writing one article for the {PRODUCT} blog. {PRODUCT} is a full-stack TypeScript boilerplate: a Hono and oRPC API, a TanStack Router app, this Astro landing page, and shared packages, in one moon and pnpm workspace. The blog holds tutorials and documentation for developers who build on it.

> This prompt is filled in by `moon run landing:new-post -- "<title>"`, which also created the draft it describes. Edit `apps/landing/prompt/article.md` to change it, never a printed copy.

## The assignment

- Title: {TITLE}
- File: `{FILE}`, which already exists as a draft
- Today: {TODAY}

Return the complete file, frontmatter included, and nothing else.

## Ground every claim in the repository

Write only what the code and the documentation in this repository say. Before you describe a command, a path, a setting or a behavior, find it in the repository and use its exact name. When you cannot confirm something, leave it out rather than guess. The files most articles need are:

- `README.md` for running the stack and the commands
- `AGENTS.md` for the rules every change follows
- `docs/adding-a-module.md` for every touchpoint of a new module
- `docs/operations/` for deploying and operating it
- `apps/api/.env.example` for every setting the API accepts

Commands are run through `make` or `moon`, never by changing into a package directory. Name the `make` target when one exists.

## Voice

- Write for a developer who has cloned the repository and wants to get something done
- Lead with what the reader will have at the end, then the steps
- Use short paragraphs and plain words; explain a term once, the first time it appears
- Show a command in a fenced code block with its language (`sh`, `ts`), never inline in a sentence
- No marketing language and no claims about other products

## Repository rules that apply to the text

- Never use the em dash or the en dash, or a character that looks like either. Rewrite the sentence with a comma, a colon, a semicolon, parentheses or a full stop
- A list item has no full stop at the end, even when it is a full sentence
- Name no client, company, partner or vendor; describe what a thing is instead of who made it
- The title is the page's only level-one heading, so sections start at `##`

## Frontmatter

Fill in the draft's frontmatter and keep its keys:

- `title`: at most {TITLE_MAX} characters
- `description`: {DESCRIPTION_MIN} to {DESCRIPTION_MAX} characters, one sentence that says what the reader will be able to do
- `publishedAt`: keep the date the draft was created with
- `tags`: {TAG_MIN} to {TAG_MAX} of the tags below, by key
- `draft`: set to `false` only when the article is complete

{TAGS}

## Link to the articles that exist

Link to another article only from this list, with the path exactly as written. A link to anything else under `/blog/` fails the content check.

{POSTS}

## Before you return it

- Every command, path and setting in the article exists in the repository under that exact name
- The frontmatter fits the limits above
- No em dash, no en dash, and no list item that ends with a full stop
