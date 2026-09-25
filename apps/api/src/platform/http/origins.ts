import { A } from "@mobily/ts-belt";

const WILDCARD = "*";
const WILDCARD_PATTERN = "[^/]*";
const REGEX_SPECIAL = /[.+?^${}()|[\]\\]/g;
const ESCAPED = "\\$&";

const patternToRegex = (pattern: string): RegExp =>
	new RegExp(
		`^${pattern.replace(REGEX_SPECIAL, ESCAPED).replaceAll(WILDCARD, WILDCARD_PATTERN)}$`,
	);

export const originsOf = (
	webOrigin: string,
	trusted: readonly string[],
): readonly string[] => A.uniq([webOrigin, ...trusted]);

export const originAllowed = (
	origin: string,
	patterns: readonly string[],
): boolean =>
	A.some(patterns, (pattern) => patternToRegex(pattern).test(origin));
