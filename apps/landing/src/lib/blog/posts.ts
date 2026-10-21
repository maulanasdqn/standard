import { A } from "@mobily/ts-belt";
import { type CollectionEntry, getCollection } from "astro:content";
import { BLOG_COLLECTION, isPublished } from "./frontmatter.ts";
import type { TBlogEntry } from "./paths.ts";
import type { TBlogTag } from "./tags.ts";

export type TPost = CollectionEntry<typeof BLOG_COLLECTION>;

const newestFirst = (left: TPost, right: TPost): number =>
	right.data.publishedAt.getTime() - left.data.publishedAt.getTime();

export const publishedPosts = async (): Promise<readonly TPost[]> => {
	const now = new Date();
	const posts = await getCollection(BLOG_COLLECTION);

	return A.sort(
		A.filter(posts, (post) => isPublished(post.data, now)),
		newestFirst,
	);
};

export const postsTagged = (
	posts: readonly TPost[],
	tag: TBlogTag,
): readonly TPost[] =>
	A.filter(posts, (post) => A.includes(post.data.tags, tag));

export const tagsIn = (posts: readonly TPost[]): readonly TBlogTag[] =>
	A.uniq(A.flat(A.map(posts, (post) => post.data.tags)));

export const entriesOf = (posts: readonly TPost[]): readonly TBlogEntry[] =>
	A.map(posts, (post): TBlogEntry => ({ slug: post.id, tags: post.data.tags }));
