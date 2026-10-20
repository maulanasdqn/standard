import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { A } from "@mobily/ts-belt";
import { match } from "ts-pattern";

const UTF8 = "utf8";
const HTML_EXTENSION = ".html";
const DIST_MISSING = "dist/ is missing, so run moon run landing:build first";

export const DIST = fileURLToPath(new URL("../../dist/", import.meta.url));
export const SRC = fileURLToPath(new URL("../../src/", import.meta.url));

export type TBuiltPage = {
	readonly file: string;
	readonly html: string;
};

export const walk = (dir: string): readonly string[] =>
	A.flat(
		A.map(readdirSync(dir, { withFileTypes: true }), (entry) =>
			entry.isDirectory()
				? walk(join(dir, entry.name))
				: [join(dir, entry.name)],
		),
	);

export const readText = (file: string): string => readFileSync(file, UTF8);

export const readDist = (file: string): string =>
	match(existsSync(join(DIST, file)))
		.with(false, (): string => {
			throw new Error(DIST_MISSING);
		})
		.otherwise((): string => readText(join(DIST, file)));

export const inDist = (file: string): boolean => existsSync(join(DIST, file));

export const builtPages = (): readonly TBuiltPage[] =>
	A.map(
		A.filter(walk(DIST), (file) => file.endsWith(HTML_EXTENSION)),
		(file): TBuiltPage => ({
			file: relative(DIST, file),
			html: readText(file),
		}),
	);
