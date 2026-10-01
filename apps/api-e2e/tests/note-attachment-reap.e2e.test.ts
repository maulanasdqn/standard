import { ROLE } from "@app/permissions";
import type { TUser, TUserCreateInput } from "@app/schemas";
import type { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiFetch } from "../support/api-fetch.ts";
import {
	attachmentRemove,
	attachmentUploaded,
	databasePool,
	noteCreate,
	reapClaimed,
	storageKeyOf,
} from "../support/note-attachments.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const DOOMED_USER: TUserCreateInput = {
	name: "E2E Attachment Owner",
	email: "e2e-attachment-owner@test.app",
	password: "E2e-password-123",
	role: ROLE.MEMBER,
};

let adminCookie = "";
let pool: Pool;

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	pool = databasePool();
});

afterAll(async (): Promise<void> => {
	await pool.end();
});

const uploadedKey = async (
	cookie: string,
	title: string,
): Promise<{ noteId: string; attachmentId: string; storageKey: string }> => {
	const noteId = await noteCreate(cookie, title);
	const uploaded = await attachmentUploaded(cookie, noteId);
	const storageKey = await storageKeyOf(pool, uploaded.id);

	return { noteId, attachmentId: uploaded.id, storageKey };
};

describe("attachment objects are claimed for the sweep on every delete path", () => {
	it("holds no claim while the row exists", async (): Promise<void> => {
		const { storageKey } = await uploadedKey(adminCookie, "Kept note");

		expect(storageKey).not.toBe("");
		expect(await reapClaimed(pool, storageKey)).toBe(false);
	});

	it("claims the key when the attachment is removed", async (): Promise<void> => {
		const { attachmentId, storageKey } = await uploadedKey(
			adminCookie,
			"Note losing an image",
		);

		await attachmentRemove(adminCookie, attachmentId);

		expect(await reapClaimed(pool, storageKey)).toBe(true);
	});

	it("claims every key when the note is deleted", async (): Promise<void> => {
		const { noteId, storageKey } = await uploadedKey(
			adminCookie,
			"Note being deleted",
		);

		await apiFetch({
			path: `/notes/${noteId}`,
			cookie: adminCookie,
			method: "DELETE",
		});

		expect(await reapClaimed(pool, storageKey)).toBe(true);
	});

	it("claims every key when the owning user is deleted and the rows cascade", async (): Promise<void> => {
		const created = (await (
			await apiFetch({
				path: "/users",
				cookie: adminCookie,
				method: "POST",
				body: DOOMED_USER,
			})
		).json()) as TUser;
		const ownerCookie = await signIn({
			email: DOOMED_USER.email,
			password: DOOMED_USER.password,
		});
		const { storageKey } = await uploadedKey(ownerCookie, "Orphaned note");

		await apiFetch({
			path: `/users/${created.id}`,
			cookie: adminCookie,
			method: "DELETE",
		});

		expect(await reapClaimed(pool, storageKey)).toBe(true);
	});
});
