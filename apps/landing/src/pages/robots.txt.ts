import type { APIRoute } from "astro";
import { CONTENT_TYPE, robotsOf } from "../lib/crawlers.ts";
import { siteOf } from "../lib/site.ts";

const CONTENT_TYPE_HEADER = "Content-Type";

export const GET: APIRoute = (context): Response =>
	new Response(robotsOf(siteOf(context.site)), {
		headers: { [CONTENT_TYPE_HEADER]: CONTENT_TYPE.TEXT },
	});
