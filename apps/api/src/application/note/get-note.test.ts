import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { getNote } from "#/application/note/get-note.ts";
import { ENotFound } from "#/application/shared/errors.ts";
import { NoteRepo } from "#/infrastructure/db/repositories/note-repository.ts";

describe("getNote", () => {
	it("fails with ENotFound when the note doesn't exist", async (): Promise<void> => {
		const testLayer = Layer.succeed(
			NoteRepo,
			NoteRepo.of({
				list: vi.fn(),
				findById: vi.fn().mockReturnValue(Effect.succeed(null)),
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
			}),
		);

		const error = await Effect.runPromise(
			getNote({ id: "11111111-1111-4111-8111-111111111111" }).pipe(
				Effect.provide(testLayer),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(ENotFound);
	});
});
