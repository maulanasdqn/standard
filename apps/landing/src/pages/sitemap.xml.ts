import type { APIRoute } from "astro";
import { blogPathsOf } from "../lib/blog/paths.ts";
import { entriesOf, publishedPosts } from "../lib/blog/posts.ts";
import { CONTENT_TYPE, LANDING_PAGES, sitemapOf } from "../lib/crawlers.ts";
import { siteOf } from "../lib/site.ts";

const CONTENT_TYPE_HEADER = "Content-Type";

export const GET: APIRoute = async (context): Promise<Response> => {
	const paths = [
		...LANDING_PAGES,
		...blogPathsOf(entriesOf(await publishedPosts())),
	];

	return new Response(sitemapOf(siteOf(context.site), paths), {
		headers: { [CONTENT_TYPE_HEADER]: CONTENT_TYPE.XML },
	});
};
