import { z } from "zod";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";

export const NOTE_ATTACHMENT_MAX_BYTES = 5_242_880;
export const NOTE_ATTACHMENT_MAX_PER_NOTE = 12;
export const NOTE_ATTACHMENT_FILE_NAME_MAX = 255;

export const NOTE_ATTACHMENT_CONTENT_TYPE = {
	JPEG: "image/jpeg",
	PNG: "image/png",
	WEBP: "image/webp",
	GIF: "image/gif",
} as const;

export type TNoteAttachmentContentType =
	(typeof NOTE_ATTACHMENT_CONTENT_TYPE)[keyof typeof NOTE_ATTACHMENT_CONTENT_TYPE];

export const NOTE_ATTACHMENT_CONTENT_TYPES = [
	NOTE_ATTACHMENT_CONTENT_TYPE.JPEG,
	NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
	NOTE_ATTACHMENT_CONTENT_TYPE.WEBP,
	NOTE_ATTACHMENT_CONTENT_TYPE.GIF,
] as const;

export const noteAttachmentContentTypeSchema = z.enum(
	NOTE_ATTACHMENT_CONTENT_TYPES,
);

export const noteAttachmentSchema = baseSchema(z.uuid()).extend({
	noteId: z.uuid(),
	fileName: z.string().min(1).max(NOTE_ATTACHMENT_FILE_NAME_MAX),
	contentType: noteAttachmentContentTypeSchema,
	byteSize: z.number().int().positive(),
	url: z.url(),
});
export type TNoteAttachment = TEntityOf<z.infer<typeof noteAttachmentSchema>>;

export const noteAttachmentFileSchema = z
	.file()
	.max(NOTE_ATTACHMENT_MAX_BYTES)
	.mime([...NOTE_ATTACHMENT_CONTENT_TYPES]);

export const noteAttachmentUploadInputSchema = z.object({
	noteId: z.uuid(),
	file: noteAttachmentFileSchema,
});
export type TNoteAttachmentUploadInput = z.infer<
	typeof noteAttachmentUploadInputSchema
>;

export const noteAttachmentListInputSchema = z.object({ noteId: z.uuid() });
export type TNoteAttachmentListInput = z.infer<
	typeof noteAttachmentListInputSchema
>;

export const noteAttachmentIdInputSchema = z.object({ id: z.uuid() });
export type TNoteAttachmentIdInput = z.infer<
	typeof noteAttachmentIdInputSchema
>;

export const noteAttachmentListSchema = z.array(noteAttachmentSchema);
export type TNoteAttachmentList = z.infer<typeof noteAttachmentListSchema>;
