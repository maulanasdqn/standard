import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { orpc } from "#/libs/orpc/client.ts";
import { invalidateNotes } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const NOTE_ID = "note-1";

const clientWithBothCached = (): QueryClient => {
	const queryClient = new QueryClient();

	queryClient.setQueryData(orpc.note.list.queryKey({ input: {} }), {
		items: [],
	});
	queryClient.setQueryData(orpc.note.get.queryKey({ input: { id: NOTE_ID } }), {
		id: NOTE_ID,
		version: 1,
	});

	return queryClient;
};

const isInvalidated = (queryClient: QueryClient, key: unknown[]): boolean =>
	queryClient.getQueryState(key)?.isInvalidated === true;

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
