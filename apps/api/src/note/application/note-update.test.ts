import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteUpdate } from "#/note/application/note-update.ts";
import { ROLE } from "@app/permissions";
import type { TNoteRow } from "#/note/domain/note.ts";
import { ActivityRecorder } from "#/shared/activity-recorder.ts";
import { ERROR_TAG } from "#/shared/error-tags.ts";
import { NoteRepo } from "#/note/domain/note.ts";

const AUTHOR_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_ACTOR = {
	id: "33333333-3333-4333-8333-333333333333",
	role: ROLE.MEMBER,
};
const NOTE_ID = "11111111-1111-4111-8111-111111111111";
const VERSION = 3;

const row: TNoteRow = {
	id: NOTE_ID,
	title: "Title",
	body: "Body",
	authorId: AUTHOR_ID,
	version: VERSION,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const INPUT = { id: NOTE_ID, version: VERSION, title: row.title };

const activityLayer = Layer.succeed(
	ActivityRecorder,
	ActivityRecorder.of({
		insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
	}),
);

describe("noteUpdate", () => {
	it("passes the actor and the expected version to the owned update query", async (): Promise<void> => {
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
			activityLayer,
		);

		const result = await Effect.runPromise(
			noteUpdate(INPUT, OTHER_ACTOR).pipe(Effect.provide(testLayer)),
		);

		expect(result.id).toBe(NOTE_ID);
		expect(update).toHaveBeenCalledWith(INPUT, OTHER_ACTOR);
	});

	it("fails with a conflict when the note is there but the version has moved on", async (): Promise<void> => {
		const update = vi.fn().mockReturnValue(Effect.succeed(null));
		const findById = vi.fn().mockReturnValue(Effect.succeed(row));
		const testLayer = Layer.merge(
			Layer.succeed(
				NoteRepo,
				NoteRepo.of({
					list: vi.fn(),
					findById,
					create: vi.fn(),
					update,
					remove: vi.fn(),
				}),
			),
			activityLayer,
		);

		const result = await Effect.runPromise(
			noteUpdate(INPUT, OTHER_ACTOR).pipe(
				Effect.provide(testLayer),
				Effect.catch((error) => Effect.succeed(error)),
			),
		);

		expect(result).toMatchObject({ _tag: ERROR_TAG.CONFLICT });
	});

	it("fails with not found when the note is gone entirely", async (): Promise<void> => {
		const update = vi.fn().mockReturnValue(Effect.succeed(null));
		const findById = vi.fn().mockReturnValue(Effect.succeed(null));
		const testLayer = Layer.merge(
			Layer.succeed(
				NoteRepo,
				NoteRepo.of({
					list: vi.fn(),
					findById,
					create: vi.fn(),
					update,
					remove: vi.fn(),
				}),
			),
			activityLayer,
		);

		const result = await Effect.runPromise(
			noteUpdate(INPUT, OTHER_ACTOR).pipe(
				Effect.provide(testLayer),
				Effect.catch((error) => Effect.succeed(error)),
			),
		);

		expect(result).toMatchObject({ _tag: ERROR_TAG.NOT_FOUND });
	});
});
