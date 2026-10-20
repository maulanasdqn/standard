import { WEB_BASE_PATH } from "@app/contract";
import {
	APP_MESSAGE,
	LANDING_FAQ,
	LANDING_FEATURES,
	LANDING_MESSAGE,
	LANDING_STEPS,
} from "@app/messages";
import { APP_VERSION } from "@app/version";
import { A, D } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { APP_LINK } from "../src/lib/links.ts";
import { ROBOTS_META } from "../src/lib/seo.ts";
import { readDist } from "./support/dist.ts";
import { hrefsOf, linkHrefOf, metaContentOf, titleOf } from "./support/html.ts";

const HOME = "index.html";
const NOT_FOUND = "404.html";
const ROOT_PATH = "/";

const sorted = (values: readonly string[]): readonly string[] =>
	A.sort(values, (left, right) => left.localeCompare(right));

describe("the home page", () => {
	const html = readDist(HOME);

	it("names itself in the title and the description", (): void => {
		expect(titleOf(html)).toBe(LANDING_MESSAGE.META_TITLE);
		expect(metaContentOf(html, "name", "description")).toBe(
			LANDING_MESSAGE.META_DESCRIPTION,
		);
		expect(metaContentOf(html, "name", "robots")).toBe(ROBOTS_META.INDEX);
	});

	it("points its canonical and og:url at the root of the site", (): void => {
		const canonical = linkHrefOf(html, "canonical") ?? "";

		expect(new URL(canonical).pathname).toBe(ROOT_PATH);
		expect(metaContentOf(html, "property", "og:url")).toBe(canonical);
	});

	it("shows the tagline and every feature, step and question", (): void => {
		const titles = A.map(
			[...LANDING_FEATURES, ...LANDING_STEPS, ...LANDING_FAQ],
			(entry) => entry.title,
		);

		A.forEach([APP_MESSAGE.TAGLINE, ...titles], (text) => {
			expect(html).toContain(text);
		});
	});

	it("names the version it was built from", (): void => {
		expect(html).toContain(`${LANDING_MESSAGE.FOOTER_VERSION} ${APP_VERSION}`);
	});

	it("links into the app only through the paths the app serves", (): void => {
		const appHrefs = A.uniq(
			A.filter(hrefsOf(html), (href) => href.startsWith(WEB_BASE_PATH)),
		);

		expect(sorted(appHrefs)).toEqual(sorted(D.values(APP_LINK)));
	});
});

describe("the not found page", () => {
	const html = readDist(NOT_FOUND);

	it("asks not to be indexed and names no canonical", (): void => {
		expect(titleOf(html)).toBe(LANDING_MESSAGE.NOT_FOUND_TITLE);
		expect(metaContentOf(html, "name", "robots")).toBe(ROBOTS_META.NOINDEX);
		expect(linkHrefOf(html, "canonical")).toBeUndefined();
	});
});
