import { noteSchema, type TNote } from "@app/schemas";
import type { TNoteRow } from "#/domain/note/note.ts";

export const toNoteDto = (row: TNoteRow): TNote =>
	noteSchema.parse({
		id: row.id,
		title: row.title,
		body: row.body,
		authorId: row.authorId,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
