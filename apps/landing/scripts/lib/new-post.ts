import { BLOG_TAG_LABEL } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { stringify } from "yaml";
import { postPathOf } from "../../src/lib/blog/paths.ts";
import type { TBlogRules } from "../../src/lib/blog/rules.ts";
import { BLOG_TAGS } from "../../src/lib/blog/tags.ts";
import { NEW_POST_MESSAGE } from "./messages.ts";
import type { TPublishedPost } from "./post-source.ts";

export type TPromptValues = Readonly<Record<string, string>>;

export type TDraft = {
	readonly title: string;
	readonly slug: string;
	readonly file: string;
	readonly today: string;
};

const PLACEHOLDER = /\{([A-Z_]+)\}/g;
const COMBINING_MARK = /\p{M}/gu;
const NOT_SLUG = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;
const HYPHEN = "-";
const LINE_BREAK = "\n";
const FRONTMATTER_FENCE = "---";
const DATE_LENGTH = 10;

export const slugOf = (title: string): string =>
	title
		.normalize("NFKD")
		.replaceAll(COMBINING_MARK, "")
		.toLowerCase()
		.replaceAll(NOT_SLUG, HYPHEN)
		.replaceAll(EDGE_HYPHENS, "");

export const dayOf = (now: Date): string =>
	now.toISOString().slice(0, DATE_LENGTH);

export const draftOf = (title: string, today: string): string => {
	const frontmatter = stringify({
		title,
		description: "",
		publishedAt: today,
		tags: [],
		draft: true,
	}).trimEnd();

	return `${A.join([FRONTMATTER_FENCE, frontmatter, FRONTMATTER_FENCE], LINE_BREAK)}${LINE_BREAK}`;
};

const bulletsOf = (lines: readonly string[]): string =>
	A.isEmpty(lines)
		? NEW_POST_MESSAGE.NO_POSTS
		: A.join(
				A.map(lines, (line) => `- ${line}`),
				LINE_BREAK,
			);

export const promptValuesOf = (
	draft: TDraft,
	rules: TBlogRules,
	posts: readonly TPublishedPost[],
	product: string,
): TPromptValues => ({
	PRODUCT: product,
	TITLE: draft.title,
	SLUG: draft.slug,
	FILE: draft.file,
	TODAY: draft.today,
	TITLE_MAX: String(rules.titleMaxChars),
	DESCRIPTION_MIN: String(rules.descriptionChars[0]),
	DESCRIPTION_MAX: String(rules.descriptionChars[1]),
	TAG_MIN: String(rules.tagCount[0]),
	TAG_MAX: String(rules.tagCount[1]),
	TAGS: bulletsOf(
		A.map(BLOG_TAGS, (tag) => `\`${tag}\`: ${BLOG_TAG_LABEL[tag] ?? tag}`),
	),
	POSTS: bulletsOf(
		A.map(
			posts,
			(post) => `[${post.frontmatter.title}](${postPathOf(post.slug)})`,
		),
	),
});

export const fillPrompt = (template: string, values: TPromptValues): string =>
	template.replaceAll(
		PLACEHOLDER,
		(whole: string, key: string): string => values[key] ?? whole,
	);

export const unfilledOf = (text: string): readonly string[] =>
	A.map([...text.matchAll(PLACEHOLDER)], ([whole]) => whole);
