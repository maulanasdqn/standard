import rules from "../../content/rules.json" with { type: "json" };

export type TRange = readonly [number, number];

export type TBlogRules = {
	readonly titleMaxChars: number;
	readonly descriptionChars: TRange;
	readonly tagCount: TRange;
	readonly reservedSlugs: readonly string[];
	readonly bannedCodePoints: readonly number[];
};

const rangeOf = (values: readonly number[]): TRange => [
	values[0] ?? 0,
	values[1] ?? 0,
];

export const BLOG_RULES: TBlogRules = {
	titleMaxChars: rules.titleMaxChars,
	descriptionChars: rangeOf(rules.descriptionChars),
	tagCount: rangeOf(rules.tagCount),
	reservedSlugs: rules.reservedSlugs,
	bannedCodePoints: rules.bannedCodePoints,
};
