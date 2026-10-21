# The blog

The landing page carries a blog of guides and documentation at `/blog/`. Articles are Markdown files in the repository, so an article is written, reviewed and merged like any other change, and the build checks it before it can reach the site.

## Where things live

| Path | Holds |
|---|---|
| `apps/landing/src/content/blog/<slug>.md` | One article. The file name is the slug and the URL is `/blog/<slug>/` |
| `apps/landing/src/content/rules.json` | Every number and list the content checks use: title and description lengths, tag counts, reserved slugs and banned characters |
| `apps/landing/src/lib/blog/tags.ts` | The tag keys. Their labels live in `BLOG_TAG_LABEL` in `@app/messages`, and a test fails when the two lists differ |
| `apps/landing/src/lib/blog/frontmatter.ts` | The frontmatter schema, shared by the site and the scripts |
| `apps/landing/prompt/article.md` | The writing prompt `new-post` fills in |

## Frontmatter

```yaml
title: Add a module to the API and the app
description: One sentence that says what the reader will be able to do.
publishedAt: 2026-10-21
updatedAt: 2026-11-02
tags:
  - modules
draft: false
```

`updatedAt` and `draft` are optional. An article is published once `draft` is not `true` and `publishedAt` is not in the future, and only published articles get a page, a place in the feed and the sitemap, and a link from the index and the tag pages. The site is static, so an article dated in the future goes live with the first build after that date, not on the date itself.

## Start an article

```sh
moon run landing:new-post -- "Add a background job"
```

It writes `apps/landing/src/content/blog/add-a-background-job.md` as a draft and prints the writing prompt with the draft's path, the limits from `rules.json`, the tags and the published articles filled in. Paste the prompt into an AI assistant and save what it returns over the draft, or ignore the prompt and write the article yourself. The repository never calls a model: the prompt is text, so no key or account is involved.

Change the prompt in `apps/landing/prompt/article.md`. Its `{NAME}` placeholders are filled by `apps/landing/scripts/lib/new-post.ts`, and a test fails when one is left unfilled.

## The content checks

```sh
moon run landing:lint-content
```

The same checks run inside `moon run landing:test`, so CI enforces them on every published article. A draft is skipped until `draft` is set to `false`. A published article fails on:

- frontmatter the schema rejects, including a tag that is not in `tags.ts`
- a title, a description or a tag count outside the limits in `rules.json`, or a tag listed twice
- a file name that is not lower-case words joined by hyphens, or one a blog route already uses
- a banned character anywhere in it, which today is the em dash and the en dash
- a level-one heading in the body, because the title is the page's only one
- a link under `/blog/` to a page the blog does not build: the index, a published article or the page of a tag one of them carries
- an `updatedAt` earlier than its `publishedAt`

The checks read the Markdown, but Astro's typesetter can still turn `---` in a sentence into an em dash on the page. `apps/landing/test/content-security.test.ts` therefore also fails a build whose pages carry a banned character, wherever it came from.

## Code blocks

Code is highlighted with Prism, which marks tokens with classes rather than inline styles, because the API serves the landing under a policy that blocks inline styles. The token colours are in `apps/landing/src/styles/global.css`.
