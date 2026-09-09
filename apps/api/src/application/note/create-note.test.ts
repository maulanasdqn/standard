import { describe, expect, it, vi } from "vitest";
import type { INoteRepo, INoteRow } from "#/domain/note/note.ts";
import { makeCreateNote } from "#/application/note/create-note.ts";

const AUTHOR_ID = "22222222-2222-4222-8222-222222222222";

const row: INoteRow = {
	id: "11111111-1111-4111-8111-111111111111",
	title: "Title",
	body: "Body",
	authorId: AUTHOR_ID,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("makeCreateNote", () => {
	it("creates a note and logs the activity", async (): Promise<void> => {
		const noteRepo: Pick<INoteRepo, "create"> = {
			create: vi.fn().mockResolvedValue(row),
		};
		const activityRepo = { insert: vi.fn().mockResolvedValue(undefined) };

		const createNote = makeCreateNote({
			noteRepo: noteRepo as INoteRepo,
			activityRepo,
		});

		const result = await createNote(
			{ title: "Title", body: "Body" },
			AUTHOR_ID,
		);

		expect(result.id).toBe(row.id);
		expect(noteRepo.create).toHaveBeenCalledWith({
			title: "Title",
			body: "Body",
			authorId: AUTHOR_ID,
		});
		expect(activityRepo.insert).toHaveBeenCalledWith(
			expect.objectContaining({ action: "note.create", entityId: row.id }),
		);
	});
});
