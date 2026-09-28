import { ACTIVITY_ACTION, ACTIVITY_DETAIL } from "@app/activity";
import { PERMISSION } from "@app/permissions";
import type { TActivityList, TNote, TRoleDto } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const AUDITED_TITLE = "Audited";
const ROLE_KEY = "e2e-activity-auditor";
const ROLE_LABEL = "Activity Auditor";
const ROLE_RENAMED = "Activity Reviewer";

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

const entryFor = async (
	action: string,
	resourceId: string,
): Promise<TActivityList["items"][number] | null | undefined> => {
	const list = await apiJson<TActivityList>({
		path: `/activity?page=1&pageSize=50&action=${action}`,
		cookie: adminCookie,
	});
	return A.find(list.items, (item) => item.resourceId === resourceId);
};

describe("activity REST endpoint", () => {
	it("records a note creation with the acting admin as actor and the title", async (): Promise<void> => {
		const note = await apiJson<TNote>({
			path: "/notes",
			cookie: adminCookie,
			method: "POST",
			body: { title: AUDITED_TITLE, body: "" },
		});

		const entry = await entryFor(ACTIVITY_ACTION.NOTE_CREATE, note.id);

		expect(entry?.action).toBe(ACTIVITY_ACTION.NOTE_CREATE);
		expect(entry?.actorEmail).toBe(SEED_CREDENTIALS.admin.email);
		expect(entry?.metadata).toEqual({ [ACTIVITY_DETAIL.TITLE]: AUDITED_TITLE });
	});

	it("records what a role update renamed, granted and revoked", async (): Promise<void> => {
		await apiJson<TRoleDto>({
			path: "/roles",
			cookie: adminCookie,
			method: "POST",
			body: {
				key: ROLE_KEY,
				label: ROLE_LABEL,
				permissions: [PERMISSION.NOTE_READ, PERMISSION.USER_READ],
			},
		});

		const created = await entryFor(ACTIVITY_ACTION.ROLE_CREATE, ROLE_KEY);
		expect(created?.metadata).toEqual({
			[ACTIVITY_DETAIL.LABEL]: ROLE_LABEL,
			[ACTIVITY_DETAIL.PERMISSION_COUNT]: 2,
		});

		await apiJson<TRoleDto>({
			path: `/roles/${ROLE_KEY}`,
			cookie: adminCookie,
			method: "PATCH",
			body: {
				label: ROLE_RENAMED,
				permissions: [PERMISSION.NOTE_READ, PERMISSION.NOTE_UPDATE],
			},
		});

		const updated = await entryFor(ACTIVITY_ACTION.ROLE_UPDATE, ROLE_KEY);
		expect(updated?.metadata).toEqual({
			[ACTIVITY_DETAIL.LABEL]: ROLE_RENAMED,
			[ACTIVITY_DETAIL.PREVIOUS_LABEL]: ROLE_LABEL,
			[ACTIVITY_DETAIL.PERMISSIONS_ADDED]: PERMISSION.NOTE_UPDATE,
			[ACTIVITY_DETAIL.PERMISSIONS_REMOVED]: PERMISSION.USER_READ,
		});

		await apiFetch({
			path: `/roles/${ROLE_KEY}`,
			cookie: adminCookie,
			method: "DELETE",
		});

		const removed = await entryFor(ACTIVITY_ACTION.ROLE_DELETE, ROLE_KEY);
		expect(removed?.metadata).toEqual({
			[ACTIVITY_DETAIL.LABEL]: ROLE_RENAMED,
			[ACTIVITY_DETAIL.PERMISSION_COUNT]: 2,
		});
	});

	it("is forbidden for a viewer", async (): Promise<void> => {
		const viewerCookie = await signIn(SEED_CREDENTIALS.viewer);
		const response = await apiFetch({
			path: "/activity?page=1&pageSize=20",
			cookie: viewerCookie,
		});
		expect(response.status).toBe(403);
	});
});
