import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteUpdate } from "#/note/application/note-update.ts";
import { ROLE } from "@app/permissions";
import type { TNoteRow } from "#/note/domain/note.ts";
import { ActivityRecorder } from "#/shared/activity-recorder.ts";
import { NoteRepo } from "#/note/domain/note.ts";

const AUTHOR_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_ACTOR = {
	id: "33333333-3333-4333-8333-333333333333",
	role: ROLE.MEMBER,
};
const NOTE_ID = "11111111-1111-4111-8111-111111111111";

const row: TNoteRow = {
	id: NOTE_ID,
	title: "Title",
	body: "Body",
	authorId: AUTHOR_ID,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("noteUpdate", () => {
	it("passes the actor to the owned update query", async (): Promise<void> => {
		const update = vi.fn().mockReturnValue(Effect.succeed(row));
		const testLayer = Layer.merge(
			Layer.succeed(
				NoteRepo,
				NoteRepo.of({
					list: vi.fn(),
					findById: vi.fn(),
					create: vi.fn(),
					update,
					remove: vi.fn(),
				}),
			),
			Layer.succeed(
				ActivityRecorder,
				ActivityRecorder.of({
					insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
				}),
			),
		);

		const result = await Effect.runPromise(
			noteUpdate({ id: NOTE_ID, title: row.title }, OTHER_ACTOR).pipe(
				Effect.provide(testLayer),
			),
		);

		expect(result.id).toBe(NOTE_ID);
		expect(update).toHaveBeenCalledWith(
			{ id: NOTE_ID, title: row.title },
			OTHER_ACTOR,
		);
	});
});
