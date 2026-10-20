import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { readText, SRC, walk } from "./support/dist.ts";

const MAX_LINES = 200;
const LINE_BREAK = "\n";

const lineCountOf = (text: string): number =>
	text.trimEnd().split(LINE_BREAK).length;

describe("the landing source", () => {
	it(`keeps every file within ${MAX_LINES} lines`, (): void => {
		const oversized = A.filter(
			walk(SRC),
			(file) => lineCountOf(readText(file)) > MAX_LINES,
		);

		expect(oversized).toEqual([]);
	});
});
