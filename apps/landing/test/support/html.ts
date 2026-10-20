import { A } from "@mobily/ts-belt";

export type TScriptTag = {
	readonly attributes: string;
	readonly body: string;
};

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const STYLE_TAG = /<style\b/gi;
const STYLE_ATTRIBUTE = /\sstyle="/gi;
const HREF = /\shref="([^"]*)"/gi;
const TITLE = /<title>([^<]*)<\/title>/i;

const firstGroup = (html: string, pattern: RegExp): string | undefined =>
	html.match(pattern)?.[1];

export const titleOf = (html: string): string | undefined =>
	firstGroup(html, TITLE);

export const metaContentOf = (
	html: string,
	attribute: string,
	key: string,
): string | undefined =>
	firstGroup(
		html,
		new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`, "i"),
	);

export const linkHrefOf = (html: string, rel: string): string | undefined =>
	firstGroup(html, new RegExp(`<link rel="${rel}" href="([^"]*)"`, "i"));

export const scriptTagsOf = (html: string): readonly TScriptTag[] =>
	A.map(
		[...html.matchAll(SCRIPT_TAG)],
		([, attributes, body]): TScriptTag => ({
			attributes: attributes ?? "",
			body: body ?? "",
		}),
	);

export const styleTagCountOf = (html: string): number =>
	[...html.matchAll(STYLE_TAG)].length;

export const styleAttributeCountOf = (html: string): number =>
	[...html.matchAll(STYLE_ATTRIBUTE)].length;

export const hrefsOf = (html: string): readonly string[] =>
	A.map([...html.matchAll(HREF)], ([, href]): string => href ?? "");
