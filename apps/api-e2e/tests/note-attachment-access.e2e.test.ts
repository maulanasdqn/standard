import { beforeAll, describe, expect, it } from "vitest";
import {
	attachmentList,
	attachmentListResponse,
	attachmentRemove,
	attachmentUpload,
	attachmentUploaded,
	noteCreate,
	pixelFile,
	type TAttachment,
} from "../support/note-attachments.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const HTTP_STATUS = {
	NOT_FOUND: 404,
} as const;

let ownerCookie = "";
let otherCookie = "";
let noteId = "";
let uploaded: TAttachment;

beforeAll(async (): Promise<void> => {
	ownerCookie = await signIn(SEED_CREDENTIALS.admin);
	otherCookie = await signIn(SEED_CREDENTIALS.member);
	noteId = await noteCreate(ownerCookie, "Note another user cannot touch");
	uploaded = await attachmentUploaded(ownerCookie, noteId);
});

describe("note attachments on someone else's note", () => {
	it("answers not found to a list", async (): Promise<void> => {
		const response = await attachmentListResponse(otherCookie, noteId);

		expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
	});

	it("answers not found to an upload and stores nothing", async (): Promise<void> => {
		const response = await attachmentUpload(otherCookie, noteId, pixelFile());

		expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
		expect(await attachmentList(ownerCookie, noteId)).toHaveLength(1);
	});

	it("answers not found to a remove and keeps the image", async (): Promise<void> => {
		const response = await attachmentRemove(otherCookie, uploaded.id);

		expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
		expect(await attachmentList(ownerCookie, noteId)).toHaveLength(1);
	});
});
