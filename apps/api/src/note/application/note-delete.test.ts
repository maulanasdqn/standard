import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteDelete } from "#/note/application/note-delete.ts";
import { ROLE } from "@app/permissions";
import { ActivityRecorder } from "#/shared/activity-recorder.ts";
import { NoteRepo } from "#/note/domain/note.ts";

const OTHER_ACTOR = {
	id: "33333333-3333-4333-8333-333333333333",
	role: ROLE.MEMBER,
};
const NOTE_ID = "11111111-1111-4111-8111-111111111111";

describe("noteDelete", () => {
	it("passes the actor to the owned delete query", async (): Promise<void> => {
		const remove = vi.fn().mockReturnValue(Effect.succeed(true));
		const testLayer = Layer.merge(
			Layer.succeed(
				NoteRepo,
				NoteRepo.of({
					list: vi.fn(),
					findById: vi.fn(),
					create: vi.fn(),
					update: vi.fn(),
					remove,
				}),
			),
			Layer.succeed(
				ActivityRecorder,
				ActivityRecorder.of({
					insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
				}),
			),
		);

		await Effect.runPromise(
			noteDelete({ id: NOTE_ID }, OTHER_ACTOR).pipe(Effect.provide(testLayer)),
		);

		expect(remove).toHaveBeenCalledWith(NOTE_ID, OTHER_ACTOR);
	});
});
