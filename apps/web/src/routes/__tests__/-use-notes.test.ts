import type { TNote, TNoteList } from "@app/schemas";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { orpc } from "#/libs/orpc/client.ts";
import { invalidateNotes } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const NOTE_ID = "018f2c4e-1a2b-7c3d-9e4f-5a6b7c8d9e0f";
const AUTHOR_ID = "018f2c4e-1a2b-7c3d-9e4f-5a6b7c8d9e01";
const TIMESTAMP = "2026-01-01T00:00:00.000Z";
const FIRST_PAGE = 1;
const PAGE_SIZE = 20;

const NOTE: TNote = {
	id: NOTE_ID,
	createdAt: TIMESTAMP,
	updatedAt: TIMESTAMP,
	title: "A seeded note",
	body: "A seeded body",
	authorId: AUTHOR_ID,
	version: 1,
};

const NOTE_LIST: TNoteList = {
	items: [NOTE],
	total: 1,
	page: FIRST_PAGE,
	pageSize: PAGE_SIZE,
};

const clientWithBothCached = (): QueryClient => {
	const queryClient = new QueryClient();

	queryClient.setQueryData(orpc.note.list.queryKey({ input: {} }), NOTE_LIST);
	queryClient.setQueryData(
		orpc.note.get.queryKey({ input: { id: NOTE_ID } }),
		NOTE,
	);

	return queryClient;
};

const isInvalidated = (
	queryClient: QueryClient,
	key: readonly unknown[],
): boolean => queryClient.getQueryState(key)?.isInvalidated === true;

describe("invalidateNotes", () => {
	it("invalidates the list, which a stale table would otherwise keep showing", async (): Promise<void> => {
		const queryClient = clientWithBothCached();

		await invalidateNotes(queryClient);

		expect(
			isInvalidated(queryClient, orpc.note.list.queryKey({ input: {} })),
		).toBe(true);
	});

	it("invalidates the single note too, so an edit does not resave a stale version", async (): Promise<void> => {
		const queryClient = clientWithBothCached();

		await invalidateNotes(queryClient);

		expect(
			isInvalidated(
				queryClient,
				orpc.note.get.queryKey({ input: { id: NOTE_ID } }),
			),
		).toBe(true);
	});
});
