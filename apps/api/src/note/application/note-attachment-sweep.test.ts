import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import {
	attachmentRepoLayer,
	attachmentStoreLayer,
	succeeding,
} from "#/note/application/note-attachment-fakes.test-support.ts";
import { noteAttachmentSweep } from "#/note/application/note-attachment-sweep.ts";
import { NOTE_ATTACHMENT_REAP_RETRY_MS } from "#/note/domain/note-attachment-store.ts";
import { EStorage } from "#/shared/errors.ts";

const KEYS = ["notes/a/one", "notes/a/two"] as const;
const STUCK_KEY = "notes/a/stuck";
const BATCH = 2;
const LARGE_BATCH = 50;

const harness = () => {
	const parts = {
		reapDue: succeeding<readonly string[]>([]),
		reapDone: succeeding(undefined),
		reapDefer: succeeding(undefined),
		remove: succeeding(undefined),
	};

	const layer = Layer.merge(
		attachmentRepoLayer({
			reapDue: parts.reapDue,
			reapDone: parts.reapDone,
			reapDefer: parts.reapDefer,
		}),
		attachmentStoreLayer({ remove: parts.remove }),
	);

	return { parts, layer };
};

describe("noteAttachmentSweep", () => {
	it("deletes every due object and clears its claim", async (): Promise<void> => {
		const { parts, layer } = harness();
		parts.reapDue.mockReturnValue(Effect.succeed(KEYS));

		const report = await Effect.runPromise(
			noteAttachmentSweep(LARGE_BATCH).pipe(Effect.provide(layer)),
		);

		expect(report.removed).toBe(KEYS.length);
		expect(report.failed).toEqual([]);
		expect(parts.remove).toHaveBeenCalledWith(KEYS[0]);
		expect(parts.remove).toHaveBeenCalledWith(KEYS[1]);
		expect(parts.reapDone).toHaveBeenCalledTimes(KEYS.length);
		expect(parts.reapDue).toHaveBeenCalledWith(LARGE_BATCH);
	});

	it("defers a key that fails and carries on with the rest", async (): Promise<void> => {
		const { parts, layer } = harness();
		parts.reapDue.mockReturnValue(Effect.succeed([STUCK_KEY, KEYS[0]]));
		parts.remove.mockImplementation((key: string) =>
			key === STUCK_KEY
				? Effect.fail(new EStorage({ cause: new Error(key) }))
				: Effect.succeed(undefined),
		);

		const report = await Effect.runPromise(
			noteAttachmentSweep(LARGE_BATCH).pipe(Effect.provide(layer)),
		);

		expect(report.removed).toBe(1);
		expect(report.failed).toEqual([
			expect.objectContaining({ storageKey: STUCK_KEY }),
		]);
		expect(parts.reapDefer).toHaveBeenCalledWith(
			STUCK_KEY,
			NOTE_ATTACHMENT_REAP_RETRY_MS,
		);
		expect(parts.reapDone).toHaveBeenCalledWith(KEYS[0]);
	});

	it("keeps taking batches while a batch comes back full", async (): Promise<void> => {
		const { parts, layer } = harness();
		parts.reapDue
			.mockReturnValueOnce(Effect.succeed(KEYS))
			.mockReturnValueOnce(Effect.succeed([STUCK_KEY]));

		const report = await Effect.runPromise(
			noteAttachmentSweep(BATCH).pipe(Effect.provide(layer)),
		);

		expect(parts.reapDue).toHaveBeenCalledTimes(2);
		expect(report.removed).toBe(KEYS.length + 1);
	});
});
