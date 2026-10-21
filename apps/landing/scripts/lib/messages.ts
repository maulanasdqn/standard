import type { TRange } from "../../src/lib/blog/rules.ts";

const rangeText = (range: TRange): string => `${range[0]} to ${range[1]}`;

export const POST_CHECK_MESSAGE = {
	FRONTMATTER: (path: string, issue: string): string =>
		`frontmatter ${path}: ${issue}`,
	SLUG_FORMAT:
		"the file name must be lower-case words joined by hyphens, such as adding-a-module.md",
	SLUG_RESERVED: (slug: string): string =>
		`the file name ${slug} is taken by a blog route`,
	TITLE_LENGTH: (max: number, actual: number): string =>
		`the title is ${actual} characters, over the ${max} allowed`,
	DESCRIPTION_LENGTH: (range: TRange, actual: number): string =>
		`the description is ${actual} characters, outside ${rangeText(range)}`,
	TAG_COUNT: (range: TRange, actual: number): string =>
		`${actual} tags, outside ${rangeText(range)}`,
	TAG_REPEATED: "a tag is listed twice",
	BANNED_CHARACTER: (codePoint: number): string =>
		`U+${codePoint.toString(16).toUpperCase().padStart(4, "0")} is not used in this repository; rewrite the sentence with ordinary punctuation`,
	HEADING_ONE:
		"the body has a level-one heading; the title is the page's only one, so start at ##",
	UPDATED_BEFORE_PUBLISHED: "updatedAt is earlier than publishedAt",
	LINK_UNKNOWN: (href: string): string =>
		`the link ${href} points at no page the blog builds`,
} as const;

export const LINT_MESSAGE = {
	PROBLEM: (slug: string, problem: string): string => `${slug}.md: ${problem}`,
	SUMMARY: (posts: number, problems: number): string =>
		`${posts} articles checked, ${problems} problems`,
} as const;

export const NEW_POST_MESSAGE = {
	USAGE: 'Usage: moon run landing:new-post -- "<title>"',
	EXISTS: (file: string): string =>
		`${file} already exists; pick another title or edit that file`,
	CREATED: (file: string): string =>
		`Created ${file} as a draft. The prompt above is ready to paste into an AI assistant, or write the article yourself.`,
	FINISH:
		"Set draft to false when it is done, then run moon run landing:lint-content.",
	NO_POSTS: "None yet.",
} as const;
