import { A } from "@mobily/ts-belt";
import { blogPathsOf } from "../src/lib/blog/paths.ts";
import { BLOG_RULES } from "../src/lib/blog/rules.ts";
import { LINT_MESSAGE } from "./lib/messages.ts";
import { BLOG_DIR } from "./lib/paths.ts";
import { postProblemsOf } from "./lib/post-checks.ts";
import { entriesOf, postSourcesIn, publishedOf } from "./lib/post-source.ts";

const EXIT_OK = 0;
const EXIT_FAILURE = 1;

const sources = postSourcesIn(BLOG_DIR);
const context = {
	rules: BLOG_RULES,
	blogPaths: blogPathsOf(entriesOf(publishedOf(sources, new Date()))),
};
const problems = A.flat(
	A.map(sources, (source) => postProblemsOf(source, context)),
);

A.forEach(problems, (problem) => {
	console.error(LINT_MESSAGE.PROBLEM(problem.slug, problem.message));
});
console.log(LINT_MESSAGE.SUMMARY(sources.length, problems.length));
process.exit(A.isEmpty(problems) ? EXIT_OK : EXIT_FAILURE);
