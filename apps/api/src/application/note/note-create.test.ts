import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteCreate } from "#/application/note/note-create.ts";
import { ACTIVITY_ACTION } from "@app/activity";
import type { TNoteRow } from "#/domain/note/note.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { NoteRepo } from "#/infrastructure/db/repositories/note-repository.ts";

const AUTHOR_ID = "22222222-2222-4222-8222-222222222222";

const row: TNoteRow = {
	id: "11111111-1111-4111-8111-111111111111",
	title: "Title",
	body: "Body",
	authorId: AUTHOR_ID,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("noteCreate", () => {
	it("creates a note and logs the activity", async (): Promise<void> => {
		const create = vi.fn().mockReturnValue(Effect.succeed(row));
		const insert = vi.fn().mockReturnValue(Effect.succeed(undefined));

		const testLayer = Layer.merge(
			Layer.succeed(
				NoteRepo,
				NoteRepo.of({
					list: vi.fn(),
					findById: vi.fn(),
					create,
					update: vi.fn(),
					remove: vi.fn(),
				}),
			),
			Layer.succeed(ActivityRepo, ActivityRepo.of({ insert, list: vi.fn() })),
		);

		const result = await Effect.runPromise(
			noteCreate({ title: "Title", body: "Body" }, AUTHOR_ID).pipe(
				Effect.provide(testLayer),
			),
		);

		expect(result.id).toBe(row.id);
		expect(create).toHaveBeenCalledWith(
			{ title: "Title", body: "Body" },
			AUTHOR_ID,
		);
		expect(insert).toHaveBeenCalledWith(
			expect.objectContaining({
				action: ACTIVITY_ACTION.NOTE_CREATE,
				entityId: row.id,
			}),
		);
	});
});
