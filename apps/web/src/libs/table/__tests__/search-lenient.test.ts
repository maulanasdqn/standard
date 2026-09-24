import { NOTE_SORT, noteListInputSchema, SORT_DIRECTION } from "@app/schemas";
import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { searchLenient } from "#/libs/table/search-lenient.ts";

type TRawNoteSearch = Parameters<
	ReturnType<typeof searchLenient<typeof noteListInputSchema>>
>[0];

const validate = searchLenient(noteListInputSchema);

const fromUrl = (value: Record<string, unknown>): TRawNoteSearch =>
	value as TRawNoteSearch;

const expectedType = (value: z.output<typeof noteListInputSchema>): unknown =>
	value;

describe("searchLenient", () => {
	it("keeps every valid value", (): void => {
		expect(
			validate(fromUrl({ page: 2, sortBy: NOTE_SORT.TITLE, search: "hello" })),
		).toMatchObject({ page: 2, sortBy: NOTE_SORT.TITLE, search: "hello" });
	});

	it("falls back to the default for a value the schema rejects", (): void => {
		expect(validate(fromUrl({ page: 0, sortBy: "nonsense" }))).toMatchObject({
			page: 1,
			sortBy: NOTE_SORT.CREATED_AT,
			sortDir: SORT_DIRECTION.DESC,
		});
	});

	it("drops only the bad value and keeps the rest", (): void => {
		expect(validate(fromUrl({ page: -3, search: "kept" }))).toMatchObject({
			page: 1,
			search: "kept",
		});
	});

	it("ignores a key the schema does not know", (): void => {
		expect(validate(fromUrl({ unknown: "value" }))).not.toHaveProperty(
			"unknown",
		);
	});

	it("returns the schema's own output type", (): void => {
		expect(expectedType(validate(fromUrl({})))).toMatchObject({ page: 1 });
	});
});
