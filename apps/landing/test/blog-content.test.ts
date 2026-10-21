import { BLOG_TAG_LABEL } from "@app/messages";
import { A, D } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { POST_CHECK_MESSAGE } from "../scripts/lib/messages.ts";
import { BLOG_DIR } from "../scripts/lib/paths.ts";
import { postProblemsOf } from "../scripts/lib/post-checks.ts";
import {
	entriesOf,
	postSourcesIn,
	publishedOf,
	type TPostSource,
} from "../scripts/lib/post-source.ts";
import { blogPathsOf } from "../src/lib/blog/paths.ts";
import { BLOG_RULES } from "../src/lib/blog/rules.ts";
import { BLOG_TAG, BLOG_TAGS } from "../src/lib/blog/tags.ts";

const EM_DASH = 8212;
const CONTEXT = {
	rules: BLOG_RULES,
	blogPaths: ["/blog/", "/blog/known-post/", "/blog/tags/modules/"],
};

const VALID = {
	title: "A valid title",
	description:
		"A description long enough to pass the lower bound of the rules, and short enough for the upper one.",
	publishedAt: "2026-10-21",
	tags: [BLOG_TAG.MODULES],
};

const sourceOf = (
	frontmatter: Record<string, unknown>,
	body = "## A section\n",
	slug = "a-valid-post",
): TPostSource => ({ slug, frontmatter: { ...VALID, ...frontmatter }, body });

const messagesOf = (source: TPostSource): readonly string[] =>
	A.map(postProblemsOf(source, CONTEXT), (problem) => problem.message);

describe("the committed articles", () => {
	it("pass every content check", (): void => {
		const sources = postSourcesIn(BLOG_DIR);
		const context = {
			rules: BLOG_RULES,
			blogPaths: blogPathsOf(entriesOf(publishedOf(sources, new Date()))),
		};

		expect(sources.length).toBeGreaterThan(0);
		expect(A.flat(A.map(sources, (s) => postProblemsOf(s, context)))).toEqual(
			[],
		);
	});

	it("only use tags that have a label", (): void => {
		expect([...D.keys(BLOG_TAG_LABEL)].sort()).toEqual([...BLOG_TAGS].sort());
	});
});

describe("the content checks", () => {
	it("accept a valid article", (): void => {
		expect(messagesOf(sourceOf({}))).toEqual([]);
	});

	it("skip a draft, however unfinished", (): void => {
		expect(messagesOf(sourceOf({ draft: true, tags: [] }))).toEqual([]);
	});

	it("reject a tag that is not in the list", (): void => {
		expect(messagesOf(sourceOf({ tags: ["unknown"] }))[0]).toContain("tags");
	});

	it("reject a title over the limit", (): void => {
		const title = "x".repeat(BLOG_RULES.titleMaxChars + 1);

		expect(messagesOf(sourceOf({ title }))).toEqual([
			POST_CHECK_MESSAGE.TITLE_LENGTH(BLOG_RULES.titleMaxChars, title.length),
		]);
	});

	it("reject a description outside the range", (): void => {
		expect(messagesOf(sourceOf({ description: "Too short." }))).toEqual([
			POST_CHECK_MESSAGE.DESCRIPTION_LENGTH(BLOG_RULES.descriptionChars, 10),
		]);
	});

	it("reject an article with no tag or a repeated one", (): void => {
		expect(messagesOf(sourceOf({ tags: [] }))).toEqual([
			POST_CHECK_MESSAGE.TAG_COUNT(BLOG_RULES.tagCount, 0),
		]);
		expect(
			messagesOf(sourceOf({ tags: [BLOG_TAG.MODULES, BLOG_TAG.MODULES] })),
		).toEqual([POST_CHECK_MESSAGE.TAG_REPEATED]);
	});

	it("reject a file name that is not a lower-case slug or is reserved", (): void => {
		expect(messagesOf(sourceOf({}, undefined, "Not_A_Slug"))).toEqual([
			POST_CHECK_MESSAGE.SLUG_FORMAT,
		]);
		expect(messagesOf(sourceOf({}, undefined, "tags"))).toEqual([
			POST_CHECK_MESSAGE.SLUG_RESERVED("tags"),
		]);
	});

	it("reject an em dash anywhere in the article", (): void => {
		const dash = String.fromCodePoint(EM_DASH);

		expect(messagesOf(sourceOf({}, `## Part ${dash} two\n`))).toEqual([
			POST_CHECK_MESSAGE.BANNED_CHARACTER(EM_DASH),
		]);
	});

	it("reject a level-one heading in the body, but not inside a code block", (): void => {
		expect(messagesOf(sourceOf({}, "# A second title\n"))).toEqual([
			POST_CHECK_MESSAGE.HEADING_ONE,
		]);
		expect(messagesOf(sourceOf({}, "```sh\n# a shell comment\n```\n"))).toEqual(
			[],
		);
	});

	it("reject a link to a blog page that is not built", (): void => {
		expect(
			messagesOf(
				sourceOf(
					{},
					"See [it](/blog/known-post/), [this](/blog/known-post) and [these](/blog/tags/modules/).\n",
				),
			),
		).toEqual([]);
		expect(messagesOf(sourceOf({}, "See [it](/blog/missing/).\n"))).toEqual([
			POST_CHECK_MESSAGE.LINK_UNKNOWN("/blog/missing/"),
		]);
	});

	it("reject an update dated before the article", (): void => {
		expect(messagesOf(sourceOf({ updatedAt: "2026-10-01" }))).toEqual([
			POST_CHECK_MESSAGE.UPDATED_BEFORE_PUBLISHED,
		]);
	});
});
