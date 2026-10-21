import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { BLOG_DIR } from "../scripts/lib/paths.ts";
import { postSourcesIn, publishedOf } from "../scripts/lib/post-source.ts";
import { BLOG_PATH, postPathOf, tagPathOf } from "../src/lib/blog/paths.ts";
import { OG_TYPE } from "../src/lib/seo.ts";
import { readDist } from "./support/dist.ts";
import {
	hrefsOf,
	linkHrefOf,
	metaContentOf,
	scriptTagsOf,
} from "./support/html.ts";

const INDEX_FILE = "index.html";
const RSS = "rss.xml";
const ARTICLE_TYPE = '"@type":"BlogPosting"';
const RSS_LINK = /<link>([^<]+)<\/link>/g;

const posts = publishedOf(postSourcesIn(BLOG_DIR), new Date());

const pageOf = (path: string): string =>
	readDist(`${path.slice(1)}${INDEX_FILE}`);

describe("the blog", () => {
	it("lists every published article on its index", (): void => {
		const hrefs = hrefsOf(pageOf(BLOG_PATH));

		expect(posts.length).toBeGreaterThan(0);
		A.forEach(posts, (post) => {
			expect(hrefs).toContain(postPathOf(post.slug));
		});
	});

	it("gives each article its canonical, its type and its structured data", (): void => {
		A.forEach(posts, (post) => {
			const html = pageOf(postPathOf(post.slug));
			const canonical = new URL(linkHrefOf(html, "canonical") ?? "");
			const jsonLd = A.map(scriptTagsOf(html), (tag) => tag.body).join("");

			expect(canonical.pathname).toBe(postPathOf(post.slug));
			expect(metaContentOf(html, "property", "og:type")).toBe(OG_TYPE.ARTICLE);
			expect(jsonLd).toContain(ARTICLE_TYPE);
			expect(html).toContain(post.frontmatter.title);
		});
	});

	it("lists each article on the page of every tag it carries", (): void => {
		A.forEach(posts, (post) => {
			A.forEach(post.frontmatter.tags, (tag) => {
				expect(hrefsOf(pageOf(tagPathOf(tag)))).toContain(
					postPathOf(post.slug),
				);
			});
		});
	});

	it("puts every published article in the feed", (): void => {
		const links = A.map(
			[...readDist(RSS).matchAll(RSS_LINK)],
			([, link]) => new URL(link ?? "").pathname,
		);

		A.forEach(posts, (post) => {
			expect(links).toContain(postPathOf(post.slug));
		});
	});
});
