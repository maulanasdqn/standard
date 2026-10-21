import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { APP_MESSAGE } from "@app/messages";
import { match } from "ts-pattern";
import { BLOG_RULES } from "../src/lib/blog/rules.ts";
import { NEW_POST_MESSAGE } from "./lib/messages.ts";
import {
	dayOf,
	draftOf,
	fillPrompt,
	promptValuesOf,
	slugOf,
} from "./lib/new-post.ts";
import {
	BLOG_DIR,
	MARKDOWN_EXTENSION,
	PROMPT_FILE,
	REPO_DIR,
	UTF8,
} from "./lib/paths.ts";
import { postSourcesIn, publishedOf } from "./lib/post-source.ts";

const EXIT_FAILURE = 1;
const ARGUMENTS_FROM = 2;
const WORD_SEPARATOR = " ";

const fail = (message: string): never => {
	console.error(message);
	process.exit(EXIT_FAILURE);
};

const title = process.argv.slice(ARGUMENTS_FROM).join(WORD_SEPARATOR).trim();
const slug = slugOf(title);
const path = join(BLOG_DIR, `${slug}${MARKDOWN_EXTENSION}`);
const file = relative(REPO_DIR, path);
const now = new Date();

match({ title, slug })
	.with({ title: "" }, (): never => fail(NEW_POST_MESSAGE.USAGE))
	.with({ slug: "" }, (): never => fail(NEW_POST_MESSAGE.USAGE))
	.otherwise((): undefined => undefined);

match(existsSync(path))
	.with(true, (): never => fail(NEW_POST_MESSAGE.EXISTS(file)))
	.otherwise((): undefined => undefined);

const draft = { title, slug, file, today: dayOf(now) };
writeFileSync(path, draftOf(draft.title, draft.today), UTF8);

const prompt = fillPrompt(
	readFileSync(PROMPT_FILE, UTF8),
	promptValuesOf(
		draft,
		BLOG_RULES,
		publishedOf(postSourcesIn(BLOG_DIR), now),
		APP_MESSAGE.NAME,
	),
);

process.stdout.write(prompt);
console.error(NEW_POST_MESSAGE.CREATED(file));
console.error(NEW_POST_MESSAGE.FINISH);
