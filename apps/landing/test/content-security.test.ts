import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { builtPages } from "./support/dist.ts";
import {
	hrefsOf,
	scriptTagsOf,
	styleAttributeCountOf,
	styleTagCountOf,
} from "./support/html.ts";

const SRC_ATTRIBUTE = /\ssrc="/i;
const DATA_BLOCK = /\stype="application\/ld\+json"/i;
const SCRIPT_SOURCE = /\ssrc="([^"]*)"/i;
const SAME_ORIGIN_PATH = /^\/(?!\/)/;
const STYLESHEET_LINK = /<link rel="stylesheet" href="([^"]*)"/gi;

const pages = builtPages();

describe("every built page", () => {
	it("is found in the build", (): void => {
		expect(pages.length).toBeGreaterThan(0);
	});

	it("runs no inline script, so the policy allows scripts from this origin only", (): void => {
		A.forEach(pages, (page) => {
			const inline = A.filter(
				scriptTagsOf(page.html),
				(tag) => !SRC_ATTRIBUTE.test(tag.attributes),
			);

			A.forEach(inline, (tag) => {
				expect(tag.attributes, page.file).toMatch(DATA_BLOCK);
			});
		});
	});

	it("carries no style element or attribute, so styles come from this origin only", (): void => {
		A.forEach(pages, (page) => {
			expect(styleTagCountOf(page.html), page.file).toBe(0);
			expect(styleAttributeCountOf(page.html), page.file).toBe(0);
		});
	});

	it("loads its scripts and stylesheets from this origin", (): void => {
		A.forEach(pages, (page) => {
			const scripts = A.filterMap(
				scriptTagsOf(page.html),
				(tag) => tag.attributes.match(SCRIPT_SOURCE)?.[1],
			);
			const stylesheets = A.map(
				[...page.html.matchAll(STYLESHEET_LINK)],
				([, href]) => href ?? "",
			);

			A.forEach([...scripts, ...stylesheets], (source) => {
				expect(source, page.file).toMatch(SAME_ORIGIN_PATH);
			});
		});
	});

	it("links nowhere through a protocol-relative URL", (): void => {
		A.forEach(pages, (page) => {
			A.forEach(hrefsOf(page.html), (href) => {
				expect(href.startsWith("//"), `${page.file}: ${href}`).toBe(false);
			});
		});
	});
});
