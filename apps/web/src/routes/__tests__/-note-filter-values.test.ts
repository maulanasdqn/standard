import {
	NOTE_ATTACHMENT_FILTER,
	NOTE_DATE_FIELD,
	NOTE_SORT,
	SORT_DIRECTION,
} from "@app/schemas";
import { describe, expect, it } from "vitest";
import {
	toNoteAttachmentFilter,
	toNoteDateField,
} from "#/routes/_authenticated/notes/_utils/note-filter-values.ts";
import { toNoteListInput } from "#/routes/_authenticated/notes/_utils/note-list-input.ts";

describe("note filter values", () => {
	it("reads the date field and falls back to the creation date", (): void => {
		expect(toNoteDateField(NOTE_DATE_FIELD.UPDATED_AT)).toBe(
			NOTE_DATE_FIELD.UPDATED_AT,
		);
		expect(toNoteDateField("anything")).toBe(NOTE_DATE_FIELD.CREATED_AT);
	});

	it("reads the attachment filter and treats anything else as no filter", (): void => {
		expect(toNoteAttachmentFilter(NOTE_ATTACHMENT_FILTER.WITH)).toBe(
			NOTE_ATTACHMENT_FILTER.WITH,
		);
		expect(toNoteAttachmentFilter(NOTE_ATTACHMENT_FILTER.WITHOUT)).toBe(
			NOTE_ATTACHMENT_FILTER.WITHOUT,
		);
		expect(toNoteAttachmentFilter("any")).toBe(undefined);
	});

	it("turns the day range in the address into instants for the API", (): void => {
		const input = toNoteListInput({
			page: 1,
			pageSize: 20,
			sortBy: NOTE_SORT.CREATED_AT,
			sortDir: SORT_DIRECTION.DESC,
			dateFrom: "2026-09-01",
		});

		expect(input.dateFrom).toBe(new Date(2026, 8, 1).toISOString());
		expect(input.dateTo).toBe(undefined);
	});
});
