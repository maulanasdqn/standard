import { z } from "astro/zod";
import { BLOG_TAG } from "./tags.ts";

export const BLOG_COLLECTION = "blog";

export const postFrontmatterSchema = z.object({
	title: z.string(),
	description: z.string(),
	publishedAt: z.coerce.date(),
	updatedAt: z.coerce.date().optional(),
	tags: z.array(z.enum(BLOG_TAG)),
	draft: z.boolean().default(false),
});

export type TPostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export const isPublished = (post: TPostFrontmatter, now: Date): boolean =>
	!post.draft && post.publishedAt.getTime() <= now.getTime();
