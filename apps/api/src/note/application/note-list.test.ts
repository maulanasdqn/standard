import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteList } from "#/note/application/note-list.ts";
import { ROLE } from "@app/permissions";
import { NOTE_SORT, SORT_DIRECTION } from "@app/schemas";
import type { TNoteRow } from "#/note/domain/note.ts";
import { NoteRepo } from "#/note/domain/note.ts";

const ACTOR = {
	id: "22222222-2222-4222-8222-222222222222",
	role: ROLE.MEMBER,
};
const SUPERADMIN_ACTOR = {
	id: "33333333-3333-4333-8333-333333333333",
	role: ROLE.SUPERADMIN,
};
const NOTE_ID = "11111111-1111-4111-8111-111111111111";
const INPUT = {
	page: 1,
	pageSize: 20,
	sortBy: NOTE_SORT.CREATED_AT,
	sortDir: SORT_DIRECTION.DESC,
};

const row: TNoteRow = {
	id: NOTE_ID,
	title: "Title",
	body: "Body",
	authorId: ACTOR.id,
	version: 1,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("noteList", () => {
	it("limits the list query to the actor", async (): Promise<void> => {
		const list = vi
			.fn()
			.mockReturnValue(Effect.succeed({ items: [row], total: 1 }));
		const testLayer = Layer.succeed(
			NoteRepo,
			NoteRepo.of({
				list,
				findById: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
			}),
		);

		const result = await Effect.runPromise(
			noteList(INPUT, ACTOR).pipe(Effect.provide(testLayer)),
		);

		expect(result.items).toHaveLength(1);
		expect(list).toHaveBeenCalledWith(INPUT, ACTOR);
	});

	it("passes superadmin to the repository", async (): Promise<void> => {
		const list = vi
			.fn()
			.mockReturnValue(Effect.succeed({ items: [row], total: 1 }));
		const testLayer = Layer.succeed(
			NoteRepo,
			NoteRepo.of({
				list,
				findById: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
			}),
		);

		await Effect.runPromise(
			noteList(INPUT, SUPERADMIN_ACTOR).pipe(Effect.provide(testLayer)),
		);

		expect(list).toHaveBeenCalledWith(INPUT, SUPERADMIN_ACTOR);
	});
});
