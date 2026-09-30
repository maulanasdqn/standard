import { NOTE_ATTACHMENT_FILTER, NOTE_DATE_FIELD } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";
import { attachmentUpload, pixelFile } from "../support/note-attachments.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const MARKER = `filter-${crypto.randomUUID().slice(0, 8)}`;
const ONE_HOUR_MS = 3_600_000;

type TNoteListQuery = Record<string, string>;

let cookie = "";

const noteCreate = async (title: string, body: string): Promise<string> => {
	const response = await fetch(`${BASE_URL}/api/notes`, {
		method: "POST",
		headers: { "Content-Type": "application/json", cookie },
		body: JSON.stringify({ title, body }),
	});
	const created = (await response.json()) as { id: string };
	return created.id;
};

const listTitles = async (
	query: TNoteListQuery,
): Promise<readonly string[]> => {
	const params = new URLSearchParams({ page: "1", pageSize: "100", ...query });
	const response = await fetch(`${BASE_URL}/api/notes?${params}`, {
		headers: { cookie },
	});
	expect(response.status).toBe(200);
	const list = (await response.json()) as { items: { title: string }[] };
	return A.map(list.items, (item) => item.title);
};

const hourFromNow = (hours: number): string =>
	new Date(Date.now() + hours * ONE_HOUR_MS).toISOString();

beforeAll(async (): Promise<void> => {
	cookie = await signIn(SEED_CREDENTIALS.admin);
	await noteCreate(`${MARKER} alpha`, "plain text");
	await noteCreate(`${MARKER} beta`, `mentions ${MARKER}-body-only`);
	const withImage = await noteCreate(`${MARKER} gamma`, "has a picture");
	await attachmentUpload(cookie, withImage, pixelFile());
});

describe("note list filters", () => {
	it("searches the body as well as the title", async (): Promise<void> => {
		const titles = await listTitles({ search: `${MARKER}-body-only` });

		expect(titles).toEqual([`${MARKER} beta`]);
	});

	it("matches the title filter against titles only", async (): Promise<void> => {
		expect(await listTitles({ title: `${MARKER}-body-only` })).toEqual([]);
		expect(await listTitles({ title: `${MARKER} al` })).toEqual([
			`${MARKER} alpha`,
		]);
	});

	it("keeps notes inside the date range and drops the ones outside", async (): Promise<void> => {
		const inside = await listTitles({
			title: MARKER,
			dateField: NOTE_DATE_FIELD.CREATED_AT,
			dateFrom: hourFromNow(-1),
			dateTo: hourFromNow(1),
		});
		const before = await listTitles({
			title: MARKER,
			dateTo: hourFromNow(-1),
		});

		expect(inside).toHaveLength(3);
		expect(before).toEqual([]);
	});

	it("splits notes by whether they have attachments", async (): Promise<void> => {
		const withAttachments = await listTitles({
			title: MARKER,
			attachments: NOTE_ATTACHMENT_FILTER.WITH,
		});
		const withoutAttachments = await listTitles({
			title: MARKER,
			attachments: NOTE_ATTACHMENT_FILTER.WITHOUT,
		});

		expect(withAttachments).toEqual([`${MARKER} gamma`]);
		expect(withoutAttachments).toHaveLength(2);
	});

	it("rejects a date that is not a full timestamp", async (): Promise<void> => {
		const params = new URLSearchParams({
			page: "1",
			pageSize: "20",
			dateFrom: "2026-09-01",
		});
		const response = await fetch(`${BASE_URL}/api/notes?${params}`, {
			headers: { cookie },
		});

		expect(response.status).toBe(400);
	});
});
