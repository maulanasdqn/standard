import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteGet } from "#/note/application/note-get.ts";
import { ROLE } from "@app/permissions";
import { ENotFound } from "#/shared/errors.ts";
import { NoteRepo } from "#/note/domain/note.ts";

const ACTOR = {
	id: "22222222-2222-4222-8222-222222222222",
	role: ROLE.MEMBER,
};

describe("noteGet", () => {
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
			noteGet({ id: "11111111-1111-4111-8111-111111111111" }, ACTOR).pipe(
				Effect.provide(testLayer),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(ENotFound);
	});
});
