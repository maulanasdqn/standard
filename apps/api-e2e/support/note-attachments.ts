import { NOTE_ATTACHMENT_CONTENT_TYPE } from "@app/schemas";
import { Pool } from "pg";
import { BASE_URL } from "./client.ts";
import { E2E_DATABASE_URL } from "./services.ts";

const PIXEL_PNG_BASE64 =
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export const PIXEL_FILE_NAME = "pixel.png";

export type TAttachment = {
	id: string;
	fileName: string;
	contentType: string;
	byteSize: number;
	url: string;
};

export const pixelFile = (name: string = PIXEL_FILE_NAME): File =>
	new File([Buffer.from(PIXEL_PNG_BASE64, "base64")], name, {
		type: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
	});

export const noteCreate = async (
	cookie: string,
	title: string,
): Promise<string> => {
	const response = await fetch(`${BASE_URL}/api/notes`, {
		method: "POST",
		headers: { "Content-Type": "application/json", cookie },
		body: JSON.stringify({ title, body: "with images" }),
	});
	const created = (await response.json()) as { id: string };
	return created.id;
};

export const attachmentUpload = (
	cookie: string,
	noteId: string,
	file: File,
): Promise<Response> => {
	const form = new FormData();
	form.append("file", file);

	return fetch(`${BASE_URL}/api/notes/${noteId}/attachments`, {
		method: "POST",
		headers: { cookie },
		body: form,
	});
};

export const attachmentUploaded = async (
	cookie: string,
	noteId: string,
): Promise<TAttachment> =>
	(await (
		await attachmentUpload(cookie, noteId, pixelFile())
	).json()) as TAttachment;

export const attachmentListResponse = (
	cookie: string,
	noteId: string,
): Promise<Response> =>
	fetch(`${BASE_URL}/api/notes/${noteId}/attachments`, {
		headers: { cookie },
	});

export const attachmentList = async (
	cookie: string,
	noteId: string,
): Promise<TAttachment[]> =>
	(await (
		await attachmentListResponse(cookie, noteId)
	).json()) as TAttachment[];

export const attachmentRemove = (
	cookie: string,
	id: string,
): Promise<Response> =>
	fetch(`${BASE_URL}/api/note-attachments/${id}`, {
		method: "DELETE",
		headers: { cookie },
	});

export const databasePool = (): Pool =>
	new Pool({ connectionString: E2E_DATABASE_URL });

export const storageKeyOf = async (
	pool: Pool,
	attachmentId: string,
): Promise<string> => {
	const result = await pool.query<{ storage_key: string }>(
		"SELECT storage_key FROM note_attachment WHERE id = $1",
		[attachmentId],
	);
	return result.rows[0]?.storage_key ?? "";
};

export const reapClaimed = async (
	pool: Pool,
	storageKey: string,
): Promise<boolean> => {
	const result = await pool.query(
		"SELECT 1 FROM note_attachment_reap WHERE storage_key = $1 AND reap_after <= now()",
		[storageKey],
	);
	return result.rowCount === 1;
};
