import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { violationsFor } from "./architecture-check.ts";

const rulesOf = (file: string, source: string): readonly string[] =>
	A.map(violationsFor(file, source), (violation) => violation.rule);

describe("fail-closed behaviour", () => {
	it("allows index.ts to sit at the module root as its surface", () => {
		expect(
			rulesOf("note/index.ts", 'export { a } from "#/note/domain/note.ts";'),
		).toEqual([]);
	});

	it("rejects a helper dropped at the module root, which would bypass the layer rules", () => {
		expect(
			rulesOf(
				"note/helpers.ts",
				'import { a } from "#/note/infrastructure/note-repository.ts";',
			),
		).toContain("module-layer");
	});

	it("rejects a directory inside a module that is not a layer", () => {
		expect(
			rulesOf(
				"note/helpers/format.ts",
				'import { a } from "#/note/domain/note.ts";',
			),
		).toContain("module-layer");
	});

	it("leaves a file inside a real layer alone", () => {
		expect(
			rulesOf(
				"note/application/note-create.ts",
				'import { a } from "#/note/domain/note.ts";',
			),
		).toEqual([]);
	});

	it("rejects a top-level directory that is neither a module nor an area", () => {
		expect(rulesOf("billing/domain/plan.ts", "")).toEqual([
			"unclassified-path",
		]);
	});

	it("rejects an import that lands somewhere it does not know", () => {
		expect(
			rulesOf(
				"note/domain/note.ts",
				'import { a } from "#/billing/domain/plan.ts";',
			),
		).toEqual(["unclassified-path"]);
	});

	it("rejects a relative path that escapes the file's own directory", () => {
		expect(
			rulesOf(
				"note/domain/note.ts",
				'import { a } from "../../user/domain/user.ts";',
			),
		).toEqual(["path-escape"]);
	});

	it("allows a sibling import inside the same directory", () => {
		expect(
			rulesOf(
				"platform/db/tables/note.ts",
				'import { user } from "./auth.ts";',
			),
		).toEqual([]);
	});
});

describe("evasion shapes", () => {
	it("classifies a specifier by where it lands, not by its first segment", () => {
		expect(
			rulesOf(
				"shared/errors.ts",
				'import { a } from "#/note/../platform/db/client.ts";',
			),
		).toEqual(["area-boundary"]);
	});

	it("rejects a dotted detour that leaves the directory", () => {
		expect(
			rulesOf(
				"note/domain/note.ts",
				'import { a } from "./../application/to-note-dto.ts";',
			),
		).toEqual(["path-escape"]);
	});

	it("rejects a dynamic import that climbs out", () => {
		expect(
			rulesOf(
				"note/domain/note.ts",
				'const m = await import("../application/to-note-dto.ts");',
			),
		).toEqual(["path-escape"]);
	});

	it("rejects a re-export that climbs out", () => {
		expect(
			rulesOf(
				"note/domain/note.ts",
				'export * from "../../user/domain/user.ts";',
			),
		).toEqual(["path-escape"]);
	});

	it("rejects an absolute specifier that climbs out of src", () => {
		expect(
			rulesOf("note/domain/note.ts", 'import { a } from "#/../scripts/x.ts";'),
		).toEqual(["path-escape"]);
	});

	it("reads a specifier split across lines the same as one on a line", () => {
		expect(
			rulesOf(
				"note/domain/note.ts",
				'import { a } from\n\t"#/user/domain/user.ts";',
			),
		).toEqual(["module-isolation"]);
	});

	it("rejects a dynamic import it cannot read", () => {
		expect(
			rulesOf("note/domain/note.ts", "const m = await import(name);"),
		).toEqual(["unchecked-specifier"]);
	});
});
