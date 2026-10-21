import { readFileSync } from "node:fs";
import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import {
	dayOf,
	draftOf,
	fillPrompt,
	promptValuesOf,
	slugOf,
	unfilledOf,
} from "../scripts/lib/new-post.ts";
import { BLOG_DIR, PROMPT_FILE, UTF8 } from "../scripts/lib/paths.ts";
import { postProblemsOf } from "../scripts/lib/post-checks.ts";
import {
	postSourceOf,
	postSourcesIn,
	publishedOf,
} from "../scripts/lib/post-source.ts";
import { postPathOf } from "../src/lib/blog/paths.ts";
import { BLOG_RULES } from "../src/lib/blog/rules.ts";

const TITLE = "Write a background job: queues & retries";
const PRODUCT = "Product";

describe("new-post", () => {
	it("turns a title into a lower-case slug", (): void => {
		expect(slugOf(TITLE)).toBe("write-a-background-job-queues-retries");
		expect(slugOf("  Déjà vu, again!  ")).toBe("deja-vu-again");
	});

	it("writes a draft that the content checks accept and the site skips", (): void => {
		const source = postSourceOf(
			slugOf(TITLE),
			draftOf(TITLE, dayOf(new Date())),
		);
		const context = { rules: BLOG_RULES, blogPaths: [] };

		expect(source.frontmatter).toMatchObject({ title: TITLE, draft: true });
		expect(postProblemsOf(source, context)).toEqual([]);
		expect(publishedOf([source], new Date())).toEqual([]);
	});

	it("fills every placeholder of the prompt and lists every published article", (): void => {
		const posts = publishedOf(postSourcesIn(BLOG_DIR), new Date());
		const prompt = fillPrompt(
			readFileSync(PROMPT_FILE, UTF8),
			promptValuesOf(
				{
					title: TITLE,
					slug: slugOf(TITLE),
					file: "draft.md",
					today: "2026-10-21",
				},
				BLOG_RULES,
				posts,
				PRODUCT,
			),
		);

		expect(unfilledOf(prompt)).toEqual([]);
		expect(prompt).toContain(TITLE);
		expect(prompt).toContain(String(BLOG_RULES.titleMaxChars));
		A.forEach(posts, (post) => {
			expect(prompt).toContain(postPathOf(post.slug));
		});
	});
});
