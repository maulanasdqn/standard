import type { APIRoute } from "astro";
import { CONTENT_TYPE, LANDING_PAGES, sitemapOf } from "../lib/crawlers.ts";
import { siteOf } from "../lib/site.ts";

const CONTENT_TYPE_HEADER = "Content-Type";

export const GET: APIRoute = (context): Response =>
	new Response(sitemapOf(siteOf(context.site), LANDING_PAGES), {
		headers: { [CONTENT_TYPE_HEADER]: CONTENT_TYPE.XML },
	});
