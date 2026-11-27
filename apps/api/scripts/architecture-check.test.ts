import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { violationsFor } from "./architecture-check.ts";

const rulesOf = (file: string, source: string): readonly string[] =>
	A.map(violationsFor(file, source), (violation) => violation.rule);

describe("layer boundaries", () => {
	it("rejects domain importing application", () => {
		expect(
			rulesOf(
				"note/domain/note.ts",
				'import { a } from "#/note/application/to-note-dto.ts";',
			),
		).toEqual(["layer-boundary"]);
	});

	it("rejects application importing infrastructure", () => {
		expect(
			rulesOf(
				"note/application/note-list.ts",
				'import { a } from "#/note/infrastructure/note-repository.ts";',
			),
		).toEqual(["layer-boundary"]);
	});

	it("allows application importing domain", () => {
		expect(
			rulesOf(
				"note/application/note-list.ts",
				'import { a } from "#/note/domain/note.ts";',
			),
		).toEqual([]);
	});

	it("allows presentation importing application", () => {
		expect(
			rulesOf(
				"note/presentation/note-router.ts",
				'import { a } from "#/note/application/note-list.ts";',
			),
		).toEqual([]);
	});
});

describe("module isolation", () => {
	it("rejects reaching into another module's internals", () => {
		expect(
			rulesOf(
				"note/application/note-list.ts",
				'import { a } from "#/user/domain/user.ts";',
			),
		).toEqual(["module-isolation"]);
	});

	it("rejects an unlisted edge even through the surface", () => {
		expect(
			rulesOf(
				"note/application/note-list.ts",
				'import { a } from "#/user/index.ts";',
			),
		).toEqual(["module-isolation"]);
	});

	it("allows a listed edge through the surface", () => {
		expect(
			rulesOf(
				"user/application/user-create.ts",
				'import { a } from "#/role/index.ts";',
			),
		).toEqual([]);
	});

	it("allows a module importing shared and platform", () => {
		expect(
			rulesOf(
				"note/application/note-list.ts",
				'import { a } from "#/shared/errors.ts";\nimport { b } from "#/platform/db/client.ts";',
			),
		).toEqual([]);
	});
});

describe("area boundaries", () => {
	it("rejects shared depending on anything but shared", () => {
		expect(
			rulesOf(
				"shared/errors.ts",
				'import { a } from "#/platform/db/client.ts";',
			),
		).toEqual(["area-boundary"]);
	});

	it("rejects platform reaching into a module", () => {
		expect(
			rulesOf("platform/db/client.ts", 'import { a } from "#/note/index.ts";'),
		).toEqual(["area-boundary"]);
	});

	it("allows the composition root to reach into modules", () => {
		expect(
			rulesOf("bootstrap/compose.ts", 'import { a } from "#/note/index.ts";'),
		).toEqual([]);
	});

	it("rejects a bootstrap file outside the composition root reaching into a module", () => {
		expect(
			rulesOf("bootstrap/tracing.ts", 'import { a } from "#/note/index.ts";'),
		).toEqual(["area-boundary"]);
	});
});
