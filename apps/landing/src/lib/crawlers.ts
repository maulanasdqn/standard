import { WEB_BASE_PATH } from "@app/contract";
import { A } from "@mobily/ts-belt";
import { HOME_PATH } from "./links.ts";
import { absoluteUrlOf } from "./site.ts";

export const SITEMAP_PATH = "/sitemap.xml";
export const LANDING_PAGES: readonly string[] = [HOME_PATH];

export const CONTENT_TYPE = {
	TEXT: "text/plain; charset=utf-8",
	XML: "application/xml; charset=utf-8",
} as const;

const LINE_BREAK = "\n";

const ROBOTS = {
	USER_AGENT: "User-agent: *",
	ALLOW: "Allow: /",
	DISALLOW: "Disallow:",
	SITEMAP: "Sitemap:",
} as const;

const SITEMAP_XML = {
	DECLARATION: '<?xml version="1.0" encoding="UTF-8"?>',
	OPEN: '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	CLOSE: "</urlset>",
} as const;

const linesOf = (lines: readonly string[]): string =>
	`${A.join(lines, LINE_BREAK)}${LINE_BREAK}`;

export const robotsOf = (site: URL): string =>
	linesOf([
		ROBOTS.USER_AGENT,
		ROBOTS.ALLOW,
		`${ROBOTS.DISALLOW} ${WEB_BASE_PATH}/`,
		`${ROBOTS.SITEMAP} ${absoluteUrlOf(SITEMAP_PATH, site)}`,
	]);

const sitemapEntryOf = (path: string, site: URL): string =>
	`<url><loc>${absoluteUrlOf(path, site)}</loc></url>`;

export const sitemapOf = (site: URL, paths: readonly string[]): string =>
	linesOf([
		SITEMAP_XML.DECLARATION,
		SITEMAP_XML.OPEN,
		...A.map(paths, (path): string => sitemapEntryOf(path, site)),
		SITEMAP_XML.CLOSE,
	]);
