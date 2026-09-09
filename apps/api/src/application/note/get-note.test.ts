import { describe, expect, it, vi } from "vitest";
import type { INoteRepo } from "#/domain/note/note.ts";
import { makeGetNote } from "#/application/note/get-note.ts";
import { AppError } from "#/application/shared/errors.ts";

describe("makeGetNote", () => {
	it("throws a NOT_FOUND AppError when the note doesn't exist", async (): Promise<void> => {
		const noteRepo: Pick<INoteRepo, "findById"> = {
			findById: vi.fn().mockResolvedValue(null),
		};
		const getNote = makeGetNote({ noteRepo: noteRepo as INoteRepo });

		await expect(
			getNote({ id: "11111111-1111-4111-8111-111111111111" }),
		).rejects.toBeInstanceOf(AppError);
	});
});
