import { A } from "@mobily/ts-belt";
import { match } from "ts-pattern";
import {
	postFrontmatterSchema,
	type TPostFrontmatter,
} from "../../src/lib/blog/frontmatter.ts";
import type { TBlogRules, TRange } from "../../src/lib/blog/rules.ts";
import { POST_CHECK_MESSAGE } from "./messages.ts";
import type { TPostSource } from "./post-source.ts";

export type TPostProblem = {
	readonly slug: string;
	readonly message: string;
};

export type TCheckContext = {
	readonly rules: TBlogRules;
	readonly blogPaths: readonly string[];
};

type TPostCheck = (
	source: TPostSource,
	post: TPostFrontmatter,
	context: TCheckContext,
) => readonly string[];

const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FENCED_CODE = /^```[\s\S]*?^```/gm;
const HEADING_ONE = /^# /m;
const BLOG_LINK = /\]\((\/blog\/[^)#\s]*)/g;
const PATH_SEPARATOR = ".";
const TRAILING_SLASH = "/";

const outside = (range: TRange, value: number): boolean =>
	value < range[0] || value > range[1];

const when = (failed: boolean, message: string): readonly string[] =>
	failed ? [message] : [];

const withoutCode = (body: string): string => body.replaceAll(FENCED_CODE, "");

const checkSlug: TPostCheck = (source, _post, context) => [
	...when(!SLUG_FORMAT.test(source.slug), POST_CHECK_MESSAGE.SLUG_FORMAT),
	...when(
		A.includes(context.rules.reservedSlugs, source.slug),
		POST_CHECK_MESSAGE.SLUG_RESERVED(source.slug),
	),
];

const checkLengths: TPostCheck = (_source, post, context) => [
	...when(
		post.title.length > context.rules.titleMaxChars,
		POST_CHECK_MESSAGE.TITLE_LENGTH(
			context.rules.titleMaxChars,
			post.title.length,
		),
	),
	...when(
		outside(context.rules.descriptionChars, post.description.length),
		POST_CHECK_MESSAGE.DESCRIPTION_LENGTH(
			context.rules.descriptionChars,
			post.description.length,
		),
	),
];

const checkTags: TPostCheck = (_source, post, context) => [
	...when(
		outside(context.rules.tagCount, post.tags.length),
		POST_CHECK_MESSAGE.TAG_COUNT(context.rules.tagCount, post.tags.length),
	),
	...when(
		A.uniq(post.tags).length !== post.tags.length,
		POST_CHECK_MESSAGE.TAG_REPEATED,
	),
];

const checkCharacters: TPostCheck = (source, post, context) => {
	const text = `${post.title}\n${post.description}\n${source.body}`;

	return A.filterMap(context.rules.bannedCodePoints, (codePoint) =>
		text.includes(String.fromCodePoint(codePoint))
			? POST_CHECK_MESSAGE.BANNED_CHARACTER(codePoint)
			: undefined,
	);
};

const checkStructure: TPostCheck = (source, post) => [
	...when(
		HEADING_ONE.test(withoutCode(source.body)),
		POST_CHECK_MESSAGE.HEADING_ONE,
	),
	...when(
		post.updatedAt !== undefined &&
			post.updatedAt.getTime() < post.publishedAt.getTime(),
		POST_CHECK_MESSAGE.UPDATED_BEFORE_PUBLISHED,
	),
];

const checkLinks: TPostCheck = (source, _post, context) =>
	A.filterMap(
		[...withoutCode(source.body).matchAll(BLOG_LINK)],
		([, href]): string | undefined => {
			const target = href ?? "";
			const path = target.endsWith(TRAILING_SLASH)
				? target
				: `${target}${TRAILING_SLASH}`;
			return A.includes(context.blogPaths, path)
				? undefined
				: POST_CHECK_MESSAGE.LINK_UNKNOWN(target);
		},
	);

const CHECKS: readonly TPostCheck[] = [
	checkSlug,
	checkLengths,
	checkTags,
	checkCharacters,
	checkStructure,
	checkLinks,
];

const problemsOf = (
	slug: string,
	messages: readonly string[],
): readonly TPostProblem[] =>
	A.map(messages, (message): TPostProblem => ({ slug, message }));

export const postProblemsOf = (
	source: TPostSource,
	context: TCheckContext,
): readonly TPostProblem[] => {
	const parsed = postFrontmatterSchema.safeParse(source.frontmatter);

	return match(parsed)
		.with(
			{ success: true, data: { draft: true } },
			(): readonly TPostProblem[] => [],
		)
		.with({ success: true }, (valid): readonly TPostProblem[] =>
			problemsOf(
				source.slug,
				A.flat(A.map(CHECKS, (check) => check(source, valid.data, context))),
			),
		)
		.with({ success: false }, (failed): readonly TPostProblem[] =>
			problemsOf(
				source.slug,
				A.map(failed.error.issues, (issue) =>
					POST_CHECK_MESSAGE.FRONTMATTER(
						issue.path.join(PATH_SEPARATOR),
						issue.message,
					),
				),
			),
		)
		.exhaustive();
};
