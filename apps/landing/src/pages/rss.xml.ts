import { BLOG_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import type { APIRoute } from "astro";
import { postPathOf } from "../lib/blog/paths.ts";
import { publishedPosts, type TPost } from "../lib/blog/posts.ts";
import { siteOf } from "../lib/site.ts";

const feedItemOf = (post: TPost): RSSFeedItem => ({
	title: post.data.title,
	description: post.data.description,
	pubDate: post.data.publishedAt,
	link: postPathOf(post.id),
});

export const GET: APIRoute = async (context): Promise<Response> =>
	rss({
		title: BLOG_MESSAGE.RSS_TITLE,
		description: BLOG_MESSAGE.INDEX_DESCRIPTION,
		site: siteOf(context.site),
		items: [...A.map(await publishedPosts(), feedItemOf)],
	});
