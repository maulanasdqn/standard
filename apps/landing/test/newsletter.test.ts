import { apiPathOf, ROUTE_PATH } from "@app/contract";
import { NEWSLETTER_MESSAGE } from "@app/messages";
import { NEWSLETTER_SOURCE, type TNewsletterSource } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { BLOG_DIR } from "../scripts/lib/paths.ts";
import { postSourcesIn, publishedOf } from "../scripts/lib/post-source.ts";
import { BLOG_PATH, postPathOf } from "../src/lib/blog/paths.ts";
import {
	NEWSLETTER_FIELD,
	NEWSLETTER_HOOK,
} from "../src/lib/newsletter-hooks.ts";
import { readDist } from "./support/dist.ts";

const INDEX_FILE = "index.html";
const NOT_FOUND = "404.html";
const FORM_TAG = new RegExp(`<form\\b[^>]*${NEWSLETTER_HOOK.FORM}[^>]*>`, "i");
const SOURCE_INPUT = new RegExp(
	`<input type="hidden" name="${NEWSLETTER_FIELD.SOURCE}" value="([^"]*)"`,
	"i",
);
const EMAIL_INPUT = new RegExp(
	`<input\\b[^>]*name="${NEWSLETTER_FIELD.EMAIL}"[^>]*>`,
	"i",
);

type TFormPage = {
	readonly file: string;
	readonly source: TNewsletterSource;
};

const posts = publishedOf(postSourcesIn(BLOG_DIR), new Date());

const fileOf = (path: string): string => `${path.slice(1)}${INDEX_FILE}`;

const FORM_PAGES: readonly TFormPage[] = [
	{ file: INDEX_FILE, source: NEWSLETTER_SOURCE.LANDING },
	{ file: fileOf(BLOG_PATH), source: NEWSLETTER_SOURCE.BLOG },
	...A.map(
		posts,
		(post): TFormPage => ({
			file: fileOf(postPathOf(post.slug)),
			source: NEWSLETTER_SOURCE.BLOG,
		}),
	),
];

describe("the newsletter form", () => {
	it("posts to the subscription endpoint from the home page and every blog page", (): void => {
		A.forEach(FORM_PAGES, (page) => {
			const form = readDist(page.file).match(FORM_TAG)?.[0] ?? "";

			expect(form, page.file).toContain('method="post"');
			expect(form, page.file).toContain(
				`action="${apiPathOf(ROUTE_PATH.NEWSLETTER_SUBSCRIPTIONS)}"`,
			);
		});
	});

	it("tells the API which page the reader signed up from", (): void => {
		A.forEach(FORM_PAGES, (page) => {
			expect(readDist(page.file).match(SOURCE_INPUT)?.[1], page.file).toBe(
				page.source,
			);
		});
	});

	it("asks for a required email address under a label", (): void => {
		const html = readDist(INDEX_FILE);
		const input = html.match(EMAIL_INPUT)?.[0] ?? "";

		expect(input).toContain('type="email"');
		expect(input).toContain("required");
		expect(html).toContain(NEWSLETTER_MESSAGE.FORM_EMAIL_LABEL);
	});

	it("announces the outcome in a live status region", (): void => {
		expect(readDist(INDEX_FILE)).toMatch(
			new RegExp(`role="status"[^>]*${NEWSLETTER_HOOK.STATUS}`),
		);
	});

	it("stays off the not found page", (): void => {
		expect(readDist(NOT_FOUND)).not.toMatch(FORM_TAG);
	});
});
