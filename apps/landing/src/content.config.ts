import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
	BLOG_COLLECTION,
	postFrontmatterSchema,
} from "./lib/blog/frontmatter.ts";

const POSTS_PATTERN = "*.md";
const POSTS_BASE = "./src/content/blog";

export const collections = {
	[BLOG_COLLECTION]: defineCollection({
		loader: glob({ pattern: POSTS_PATTERN, base: POSTS_BASE }),
		schema: postFrontmatterSchema,
	}),
};
