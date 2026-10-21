import { fileURLToPath } from "node:url";

export const REPO_DIR = fileURLToPath(new URL("../../../../", import.meta.url));
export const BLOG_DIR = fileURLToPath(
	new URL("../../src/content/blog/", import.meta.url),
);
export const PROMPT_FILE = fileURLToPath(
	new URL("../../prompt/article.md", import.meta.url),
);

export const MARKDOWN_EXTENSION = ".md";
export const UTF8 = "utf8";
