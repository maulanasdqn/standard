import {
	NOTE_ATTACHMENT_FILTER,
	NOTE_DATE_FIELD,
	type TNoteAttachmentFilter,
	type TNoteDateField,
	type TNoteListInput,
} from "@app/schemas";
import { and, eq, gte, lte, or, type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { match, P } from "ts-pattern";
import { containsWhere } from "#/platform/db/search.ts";
import { note } from "#/platform/db/tables/note.ts";
import { noteAttachment } from "#/platform/db/tables/note-attachment.ts";

const DATE_COLUMN: Record<TNoteDateField, AnyPgColumn> = {
	[NOTE_DATE_FIELD.CREATED_AT]: note.createdAt,
	[NOTE_DATE_FIELD.UPDATED_AT]: note.updatedAt,
};

const hasAttachment = sql`exists (select 1 from ${noteAttachment} where ${eq(noteAttachment.noteId, note.id)})`;

const searchWhere = (search: string | undefined): SQL | undefined =>
	match(search)
		.with(P.nonNullable, (value) =>
			or(containsWhere(note.title, value), containsWhere(note.body, value)),
		)
		.otherwise(() => undefined);

const titleWhere = (title: string | undefined): SQL | undefined =>
	match(title)
		.with(P.nonNullable, (value) => containsWhere(note.title, value))
		.otherwise(() => undefined);

const boundWhere = (
	value: string | undefined,
	toWhere: (at: Date) => SQL,
): SQL | undefined =>
	match(value)
		.with(P.nonNullable, (at) => toWhere(new Date(at)))
		.otherwise(() => undefined);

const dateWhere = (input: TNoteListInput): SQL | undefined => {
	const column = DATE_COLUMN[input.dateField ?? NOTE_DATE_FIELD.CREATED_AT];
	return and(
		boundWhere(input.dateFrom, (at) => gte(column, at)),
		boundWhere(input.dateTo, (at) => lte(column, at)),
	);
};

const attachmentWhere = (
	filter: TNoteAttachmentFilter | undefined,
): SQL | undefined =>
	match(filter)
		.with(NOTE_ATTACHMENT_FILTER.WITH, () => hasAttachment)
		.with(NOTE_ATTACHMENT_FILTER.WITHOUT, () => sql`not ${hasAttachment}`)
		.with(undefined, () => undefined)
		.exhaustive();

export const noteFilterWhere = (input: TNoteListInput): SQL | undefined =>
	and(
		searchWhere(input.search),
		titleWhere(input.title),
		dateWhere(input),
		attachmentWhere(input.attachments),
	);
