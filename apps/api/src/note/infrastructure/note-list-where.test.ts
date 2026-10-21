import {
	NOTE_ATTACHMENT_FILTER,
	NOTE_DATE_FIELD,
	noteListInputSchema,
	type TNoteListInput,
} from "@app/schemas";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { noteFilterWhere } from "#/note/infrastructure/note-list-where.ts";

const SEARCH = "budget";
const FROM = "2026-03-01T00:00:00.000Z";
const dialect = new PgDialect();

const renderedFor = (
	patch: Partial<TNoteListInput>,
): { sql: string; params: unknown[] } | undefined => {
	const where = noteFilterWhere({ ...noteListInputSchema.parse({}), ...patch });
	return where === undefined ? undefined : dialect.sqlToQuery(where);
};

describe("noteFilterWhere", () => {
	it("adds no condition when no filter is given", (): void => {
		expect(renderedFor({})).toBeUndefined();
	});

	it("matches the search in the title or the body", (): void => {
		const rendered = renderedFor({ search: SEARCH });

		expect(rendered?.sql).toContain('"title" ilike');
		expect(rendered?.sql).toContain(" or ");
		expect(rendered?.sql).toContain('"body" ilike');
		expect(rendered?.params).toEqual([`%${SEARCH}%`, `%${SEARCH}%`]);
	});

	it("matches the title filter in the title only", (): void => {
		const rendered = renderedFor({ title: SEARCH });

		expect(rendered?.sql).toContain('"title" ilike');
		expect(rendered?.sql).not.toContain('"body"');
	});

	it("bounds the creation date unless another date field is chosen", (): void => {
		expect(renderedFor({ dateFrom: FROM })?.sql).toContain('"created_at" >=');
		expect(
			renderedFor({ dateFrom: FROM, dateField: NOTE_DATE_FIELD.UPDATED_AT })
				?.sql,
		).toContain('"updated_at" >=');
	});

	it("keeps notes with an attachment, or only those without one", (): void => {
		const withOne = renderedFor({ attachments: NOTE_ATTACHMENT_FILTER.WITH });
		const without = renderedFor({
			attachments: NOTE_ATTACHMENT_FILTER.WITHOUT,
		});

		expect(withOne?.sql).toMatch(/^exists \(select 1 from "note_attachment"/);
		expect(without?.sql).toMatch(/^not exists \(select 1 from/);
	});
});
