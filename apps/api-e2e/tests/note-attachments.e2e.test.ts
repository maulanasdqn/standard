import { NOTE_ATTACHMENT_CONTENT_TYPE } from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";
import {
	attachmentList,
	attachmentRemove,
	attachmentUpload,
	attachmentUploaded,
	noteCreate,
	PIXEL_FILE_NAME,
	pixelFile,
	type TAttachment,
} from "../support/note-attachments.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const HTTP_STATUS = {
	OK: 200,
	BAD_REQUEST: 400,
	PAYLOAD_TOO_LARGE: 413,
} as const;

const CONTENT_DISPOSITION_INLINE = "inline";
const FILE_NAME_MAX = 255;
const OVERSIZED_BYTES = 8 * 1_048_576;

let cookie = "";

beforeAll(async (): Promise<void> => {
	cookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("note attachments", () => {
	it("stores an image and hands back a link the browser can read", async (): Promise<void> => {
		const noteId = await noteCreate(cookie, "Note with an image");

		const uploadResponse = await attachmentUpload(cookie, noteId, pixelFile());
		expect(uploadResponse.status).toBe(HTTP_STATUS.OK);

		const uploaded = (await uploadResponse.json()) as TAttachment;
		expect(uploaded.fileName).toBe(PIXEL_FILE_NAME);
		expect(uploaded.byteSize).toBeGreaterThan(0);

		const objectResponse = await fetch(uploaded.url);
		expect(objectResponse.status).toBe(HTTP_STATUS.OK);
		expect(objectResponse.headers.get("content-type")).toBe(
			NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
		);
		expect(objectResponse.headers.get("content-disposition")).toBe(
			CONTENT_DISPOSITION_INLINE,
		);

		const listed = await attachmentList(cookie, noteId);
		expect(listed).toHaveLength(1);
		expect(listed[0]?.id).toBe(uploaded.id);
	});

	it("refuses a file whose type is not an allowed image", async (): Promise<void> => {
		const noteId = await noteCreate(cookie, "Note that rejects a text file");

		const response = await attachmentUpload(
			cookie,
			noteId,
			new File(["not an image"], "note.txt", { type: "text/plain" }),
		);

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(await attachmentList(cookie, noteId)).toHaveLength(0);
	});

	it("refuses bytes that only claim to be an image", async (): Promise<void> => {
		const noteId = await noteCreate(cookie, "Note that sniffs its uploads");

		const response = await attachmentUpload(
			cookie,
			noteId,
			new File(["<html>not a png</html>"], "fake.png", {
				type: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
			}),
		);

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(await attachmentList(cookie, noteId)).toHaveLength(0);
	});

	it("refuses a file name the listing could not serve back", async (): Promise<void> => {
		const noteId = await noteCreate(cookie, "Note with a long file name");

		const response = await attachmentUpload(
			cookie,
			noteId,
			pixelFile(`${"a".repeat(FILE_NAME_MAX)}.png`),
		);

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(await attachmentList(cookie, noteId)).toHaveLength(0);
	});

	it("answers 413 for a body over the upload limit without buffering it", async (): Promise<void> => {
		const noteId = await noteCreate(cookie, "Note with an oversized upload");

		const response = await fetch(
			`${BASE_URL}/api/notes/${noteId}/attachments`,
			{
				method: "POST",
				headers: { cookie, "Content-Type": "application/octet-stream" },
				body: new Uint8Array(OVERSIZED_BYTES),
			},
		);

		expect(response.status).toBe(HTTP_STATUS.PAYLOAD_TOO_LARGE);
	});

	it("removes an image from the note", async (): Promise<void> => {
		const noteId = await noteCreate(cookie, "Note that loses its image");
		const uploaded = await attachmentUploaded(cookie, noteId);

		const removeResponse = await attachmentRemove(cookie, uploaded.id);

		expect(removeResponse.status).toBe(HTTP_STATUS.OK);
		expect(await attachmentList(cookie, noteId)).toHaveLength(0);
	});
});
