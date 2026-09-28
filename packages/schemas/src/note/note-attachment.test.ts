import { describe, expect, it } from "vitest";
import {
	NOTE_ATTACHMENT_CONTENT_TYPE,
	NOTE_ATTACHMENT_FILE_NAME_MAX,
	noteAttachmentUploadInputSchema,
} from "./note-attachment.ts";

const NOTE_ID = "11111111-1111-4111-8111-111111111111";
const NAME_CHARACTER = "a";

const inputNamed = (name: string): { noteId: string; file: File } => ({
	noteId: NOTE_ID,
	file: new File([new Uint8Array([1])], name, {
		type: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
	}),
});

describe("noteAttachmentUploadInputSchema", () => {
	it("accepts a file name at the maximum length", (): void => {
		const name = NAME_CHARACTER.repeat(NOTE_ATTACHMENT_FILE_NAME_MAX);

		expect(
			noteAttachmentUploadInputSchema.safeParse(inputNamed(name)).success,
		).toBe(true);
	});

	it("rejects an empty file name", (): void => {
		expect(
			noteAttachmentUploadInputSchema.safeParse(inputNamed("")).success,
		).toBe(false);
	});

	it("rejects a file name over the maximum length", (): void => {
		const name = NAME_CHARACTER.repeat(NOTE_ATTACHMENT_FILE_NAME_MAX + 1);

		expect(
			noteAttachmentUploadInputSchema.safeParse(inputNamed(name)).success,
		).toBe(false);
	});
});
