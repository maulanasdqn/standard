import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteAttachmentSweep } from "#/note/application/note-attachment-sweep.ts";
import { NoteAttachmentStore } from "#/note/domain/note-attachment-store.ts";
import { NoteAttachmentRepo } from "#/note/domain/note-attachment.ts";

const KEYS = ["notes/a/one", "notes/a/two"] as const;

describe("noteAttachmentSweep", () => {
	it("deletes every due object and clears its claim", async (): Promise<void> => {
		const remove = vi.fn().mockReturnValue(Effect.succeed(undefined));
		const reapDone = vi.fn().mockReturnValue(Effect.succeed(undefined));
		const reapDue = vi.fn().mockReturnValue(Effect.succeed(KEYS));

		const testLayer = Layer.merge(
			Layer.succeed(
				NoteAttachmentRepo,
				NoteAttachmentRepo.of({
					listByNote: vi.fn(),
					countByNote: vi.fn(),
					findById: vi.fn(),
					create: vi.fn(),
					remove: vi.fn(),
					reapClaim: vi.fn(),
					reapClaimForNote: vi.fn(),
					reapRelease: vi.fn(),
					reapDue,
					reapDone,
				}),
			),
			Layer.succeed(
				NoteAttachmentStore,
				NoteAttachmentStore.of({ put: vi.fn(), remove, url: vi.fn() }),
			),
		);

		const swept = await Effect.runPromise(
			noteAttachmentSweep(50).pipe(Effect.provide(testLayer)),
		);

		expect(swept).toBe(KEYS.length);
		expect(remove).toHaveBeenCalledWith(KEYS[0]);
		expect(remove).toHaveBeenCalledWith(KEYS[1]);
		expect(reapDone).toHaveBeenCalledTimes(KEYS.length);
		expect(reapDue).toHaveBeenCalledWith(expect.any(Date), 50);
	});
});
