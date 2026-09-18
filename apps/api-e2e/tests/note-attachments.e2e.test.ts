import { NOTE_ATTACHMENT_CONTENT_TYPE } from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const PIXEL_PNG_BASE64 =
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const HTTP_STATUS = {
	OK: 200,
	BAD_REQUEST: 400,
} as const;

type TAttachment = {
	id: string;
	fileName: string;
	byteSize: number;
	url: string;
};

let cookie = "";

const pixelFile = (): File =>
	new File([Buffer.from(PIXEL_PNG_BASE64, "base64")], "pixel.png", {
		type: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
	});

const noteCreate = async (title: string): Promise<string> => {
	const response = await fetch(`${BASE_URL}/api/notes`, {
		method: "POST",
		headers: { "Content-Type": "application/json", cookie },
		body: JSON.stringify({ title, body: "with images" }),
	});
	const created = (await response.json()) as { id: string };
	return created.id;
};

const attachmentUpload = (noteId: string, file: File): Promise<Response> => {
	const form = new FormData();
	form.append("file", file);

	return fetch(`${BASE_URL}/api/notes/${noteId}/attachments`, {
		method: "POST",
		headers: { cookie },
		body: form,
	});
};

const attachmentList = async (noteId: string): Promise<TAttachment[]> => {
	const response = await fetch(`${BASE_URL}/api/notes/${noteId}/attachments`, {
		headers: { cookie },
	});
	return (await response.json()) as TAttachment[];
};

beforeAll(async (): Promise<void> => {
	cookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("note attachments", () => {
	it("stores an image and hands back a link the browser can read", async (): Promise<void> => {
		const noteId = await noteCreate("Note with an image");

		const uploadResponse = await attachmentUpload(noteId, pixelFile());
		expect(uploadResponse.status).toBe(HTTP_STATUS.OK);

		const uploaded = (await uploadResponse.json()) as TAttachment;
		expect(uploaded.fileName).toBe("pixel.png");
		expect(uploaded.byteSize).toBeGreaterThan(0);

		const objectResponse = await fetch(uploaded.url);
		expect(objectResponse.status).toBe(HTTP_STATUS.OK);
		expect(objectResponse.headers.get("content-type")).toBe(
			NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
		);

		const listed = await attachmentList(noteId);
		expect(listed).toHaveLength(1);
		expect(listed[0]?.id).toBe(uploaded.id);
	});

	it("refuses a file whose type is not an allowed image", async (): Promise<void> => {
		const noteId = await noteCreate("Note that rejects a text file");

		const response = await attachmentUpload(
			noteId,
			new File(["not an image"], "note.txt", { type: "text/plain" }),
		);

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(await attachmentList(noteId)).toHaveLength(0);
	});

	it("removes an image from the note", async (): Promise<void> => {
		const noteId = await noteCreate("Note that loses its image");
		const uploaded = (await (
			await attachmentUpload(noteId, pixelFile())
		).json()) as TAttachment;

		const removeResponse = await fetch(
			`${BASE_URL}/api/note-attachments/${uploaded.id}`,
			{ method: "DELETE", headers: { cookie } },
		);

		expect(removeResponse.status).toBe(HTTP_STATUS.OK);
		expect(await attachmentList(noteId)).toHaveLength(0);
	});
});
