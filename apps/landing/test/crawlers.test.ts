import { WEB_BASE_PATH } from "@app/contract";
import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { LANDING_PAGES, SITEMAP_PATH } from "../src/lib/crawlers.ts";
import { inDist, readDist } from "./support/dist.ts";
import { linkHrefOf } from "./support/html.ts";

const ROBOTS = "robots.txt";
const SITEMAP = "sitemap.xml";
const HOME = "index.html";
const INDEX_FILE = "index.html";
const SITEMAP_LINE = /^Sitemap: (\S+)$/m;
const LOC = /<loc>([^<]+)<\/loc>/g;

const sitemapUrls = (): readonly URL[] =>
	A.map(
		[...readDist(SITEMAP).matchAll(LOC)],
		([, loc]): URL => new URL(loc ?? ""),
	);

const builtFileOf = (path: string): string =>
	path.endsWith("/") ? `${path.slice(1)}${INDEX_FILE}` : path.slice(1);

describe("robots.txt", () => {
	const robots = readDist(ROBOTS);

	it("keeps crawlers out of the app", (): void => {
		expect(robots).toContain(`Disallow: ${WEB_BASE_PATH}/`);
	});

	it("names the sitemap", (): void => {
		const sitemap = new URL(robots.match(SITEMAP_LINE)?.[1] ?? "");

		expect(sitemap.pathname).toBe(SITEMAP_PATH);
	});
});

describe("sitemap.xml", () => {
	it("lists every landing page, and each one is built", (): void => {
		const paths = A.map(sitemapUrls(), (url) => url.pathname);

		expect(paths).toEqual(LANDING_PAGES);
		A.forEach(paths, (path) => {
			expect(inDist(builtFileOf(path)), path).toBe(true);
		});
	});

	it("uses the same origin as the canonical links", (): void => {
		const canonical = new URL(linkHrefOf(readDist(HOME), "canonical") ?? "");

		A.forEach(sitemapUrls(), (url) => {
			expect(url.origin).toBe(canonical.origin);
		});
	});
});
