import { noteAttachmentSchema, type TNoteAttachment } from "@app/schemas";
import type { TNoteAttachmentRow } from "#/note/domain/note-attachment.ts";

export const toNoteAttachmentDto = (
	row: TNoteAttachmentRow,
	url: string,
): TNoteAttachment =>
	noteAttachmentSchema.parse({
		id: row.id,
		noteId: row.noteId,
		fileName: row.fileName,
		contentType: row.contentType,
		byteSize: row.byteSize,
		url,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
