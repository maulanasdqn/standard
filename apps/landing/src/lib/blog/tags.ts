import { BLOG_TAG_LABEL } from "@app/messages";
import { D } from "@mobily/ts-belt";

export const BLOG_TAG = {
	GETTING_STARTED: "getting-started",
	MODULES: "modules",
	DEPLOYMENT: "deployment",
	TESTING: "testing",
	OPERATIONS: "operations",
} as const;

export type TBlogTag = (typeof BLOG_TAG)[keyof typeof BLOG_TAG];

export const BLOG_TAGS: readonly TBlogTag[] = D.values(BLOG_TAG);

export const tagLabelOf = (tag: TBlogTag): string => BLOG_TAG_LABEL[tag] ?? tag;
