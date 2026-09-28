import { ACTIVITY_DETAIL } from "@app/activity";
import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteDelete } from "#/note/application/note-delete.ts";
import { ROLE } from "@app/permissions";
import { ActivityRecorder } from "#/shared/activity-recorder.ts";
import { NoteRepo, type TNoteRow } from "#/note/domain/note.ts";

const OTHER_ACTOR = {
	id: "33333333-3333-4333-8333-333333333333",
	role: ROLE.MEMBER,
};
const NOTE_ID = "11111111-1111-4111-8111-111111111111";

const row: TNoteRow = {
	id: NOTE_ID,
	title: "Title",
	body: "Body",
	authorId: OTHER_ACTOR.id,
	version: 1,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("noteDelete", () => {
	it("passes the actor to the owned delete query and records the title", async (): Promise<void> => {
		const remove = vi.fn().mockReturnValue(Effect.succeed(true));
		const insert = vi.fn().mockReturnValue(Effect.succeed(undefined));
		const testLayer = Layer.merge(
			Layer.succeed(
				NoteRepo,
				NoteRepo.of({
					list: vi.fn(),
					findById: vi.fn().mockReturnValue(Effect.succeed(row)),
					create: vi.fn(),
					update: vi.fn(),
					remove,
				}),
			),
			Layer.succeed(ActivityRecorder, ActivityRecorder.of({ insert })),
		);

		await Effect.runPromise(
			noteDelete({ id: NOTE_ID }, OTHER_ACTOR).pipe(Effect.provide(testLayer)),
		);

		expect(remove).toHaveBeenCalledWith(NOTE_ID, OTHER_ACTOR);
		expect(insert).toHaveBeenCalledWith(
			expect.objectContaining({
				metadata: { [ACTIVITY_DETAIL.TITLE]: row.title },
			}),
		);
	});
});
