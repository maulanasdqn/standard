import type { TActivityList, TNote } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const NOTE_CREATE_ACTION = "note.create";

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("activity REST endpoint", () => {
	it("records a note creation with the acting admin as actor", async (): Promise<void> => {
		const note = await apiJson<TNote>({
			path: "/notes",
			cookie: adminCookie,
			method: "POST",
			body: { title: "Audited", body: "" },
		});

		const list = await apiJson<TActivityList>({
			path: `/activity?page=1&pageSize=20&action=${NOTE_CREATE_ACTION}`,
			cookie: adminCookie,
		});
		const entry = A.find(list.items, (item) => item.entityId === note.id);

		expect(entry?.action).toBe(NOTE_CREATE_ACTION);
		expect(entry?.actorEmail).toBe(SEED_CREDENTIALS.admin.email);
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
