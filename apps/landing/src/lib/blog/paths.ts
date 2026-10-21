import { A } from "@mobily/ts-belt";
import type { TBlogTag } from "./tags.ts";

export const BLOG_PATH = "/blog/";
export const RSS_PATH = "/rss.xml";

const TAGS_SEGMENT = "tags";

export const postPathOf = (slug: string): string => `${BLOG_PATH}${slug}/`;

export const tagPathOf = (tag: TBlogTag): string =>
	`${BLOG_PATH}${TAGS_SEGMENT}/${tag}/`;

export type TBlogEntry = {
	readonly slug: string;
	readonly tags: readonly TBlogTag[];
};

export const blogPathsOf = (
	entries: readonly TBlogEntry[],
): readonly string[] => [
	BLOG_PATH,
	...A.map(entries, (entry) => postPathOf(entry.slug)),
	...A.map(A.uniq(A.flat(A.map(entries, (entry) => entry.tags))), tagPathOf),
];
