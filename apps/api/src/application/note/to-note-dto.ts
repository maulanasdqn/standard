import { noteSchema, type TNote } from "@app/schemas";
import type { INoteRow } from "#/domain/note/note.ts";

export const toNoteDto = (row: INoteRow): TNote =>
	noteSchema.parse({
		id: row.id,
		title: row.title,
		body: row.body,
		authorId: row.authorId,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
