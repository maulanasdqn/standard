import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { A } from "@mobily/ts-belt";
import { parse } from "yaml";
import {
	isPublished,
	postFrontmatterSchema,
	type TPostFrontmatter,
} from "../../src/lib/blog/frontmatter.ts";
import type { TBlogEntry } from "../../src/lib/blog/paths.ts";
import { MARKDOWN_EXTENSION, UTF8 } from "./paths.ts";

export type TPostSource = {
	readonly slug: string;
	readonly frontmatter: unknown;
	readonly body: string;
};

export type TPublishedPost = {
	readonly slug: string;
	readonly frontmatter: TPostFrontmatter;
};

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export const postSourceOf = (slug: string, text: string): TPostSource => {
	const found = text.match(FRONTMATTER);

	return {
		slug,
		frontmatter: found ? parse(found[1] ?? "") : undefined,
		body: found?.[2] ?? text,
	};
};

export const postSourcesIn = (dir: string): readonly TPostSource[] =>
	A.map(
		A.filter(readdirSync(dir), (file) => file.endsWith(MARKDOWN_EXTENSION)),
		(file): TPostSource =>
			postSourceOf(
				basename(file, MARKDOWN_EXTENSION),
				readFileSync(join(dir, file), UTF8),
			),
	);

export const publishedOf = (
	sources: readonly TPostSource[],
	now: Date,
): readonly TPublishedPost[] =>
	A.filterMap(sources, (source): TPublishedPost | undefined => {
		const parsed = postFrontmatterSchema.safeParse(source.frontmatter);

		return parsed.success && isPublished(parsed.data, now)
			? { slug: source.slug, frontmatter: parsed.data }
			: undefined;
	});

export const entriesOf = (
	posts: readonly TPublishedPost[],
): readonly TBlogEntry[] =>
	A.map(
		posts,
		(post): TBlogEntry => ({ slug: post.slug, tags: post.frontmatter.tags }),
	);
