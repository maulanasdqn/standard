import { ACTIVITY_ACTION } from "@app/activity";
import { NOTE_ATTACHMENT_MESSAGE } from "@app/messages";
import { ROLE } from "@app/permissions";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import {
	ATTACHMENT_ID,
	AUTHOR_ID,
	attachmentRepoLayer,
	attachmentRow,
	noteRepoLayer,
	noteRow,
	succeeding,
} from "#/note/application/note-attachment-fakes.test-support.ts";
import { noteAttachmentRemove } from "#/note/application/note-attachment-remove.ts";
import type { TNoteAttachmentRow } from "#/note/domain/note-attachment.ts";
import type { TNoteRow } from "#/note/domain/note.ts";
import { ActivityRecorder } from "#/shared/activity-recorder.ts";

const ACTOR = { id: AUTHOR_ID, role: ROLE.MEMBER };

const harness = () => {
	const parts = {
		findAttachment: succeeding<TNoteAttachmentRow | null>(attachmentRow),
		findNote: succeeding<TNoteRow | null>(noteRow),
		remove: succeeding(true),
		insert: succeeding(undefined),
	};

	const layer = Layer.mergeAll(
		noteRepoLayer({ findById: parts.findNote }),
		attachmentRepoLayer({
			findById: parts.findAttachment,
			remove: parts.remove,
		}),
		Layer.succeed(
			ActivityRecorder,
			ActivityRecorder.of({ insert: parts.insert }),
		),
	);

	return { parts, layer };
};

type THarness = ReturnType<typeof harness>;

const run = (layer: THarness["layer"]): Promise<{ id: string }> =>
	Effect.runPromise(
		noteAttachmentRemove({ id: ATTACHMENT_ID }, ACTOR).pipe(
			Effect.provide(layer),
		),
	);

describe("noteAttachmentRemove", () => {
	it("removes the row and records the activity", async (): Promise<void> => {
		const { parts, layer } = harness();

		await expect(run(layer)).resolves.toEqual({ id: ATTACHMENT_ID });
		expect(parts.remove).toHaveBeenCalledWith(ATTACHMENT_ID);
		expect(parts.insert).toHaveBeenCalledWith(
			expect.objectContaining({
				action: ACTIVITY_ACTION.NOTE_ATTACHMENT_DELETE,
			}),
		);
	});

	it("answers not found for an attachment on someone else's note, without deleting", async (): Promise<void> => {
		const { parts, layer } = harness();
		parts.findNote.mockReturnValue(Effect.succeed(null));

		await expect(run(layer)).rejects.toThrow(NOTE_ATTACHMENT_MESSAGE.NOT_FOUND);
		expect(parts.remove).not.toHaveBeenCalled();
	});

	it("answers not found for an attachment that does not exist", async (): Promise<void> => {
		const { parts, layer } = harness();
		parts.findAttachment.mockReturnValue(Effect.succeed(null));

		await expect(run(layer)).rejects.toThrow(NOTE_ATTACHMENT_MESSAGE.NOT_FOUND);
		expect(parts.findNote).not.toHaveBeenCalled();
	});

	it("does not record a second removal when a concurrent delete won", async (): Promise<void> => {
		const { parts, layer } = harness();
		parts.remove.mockReturnValue(Effect.succeed(false));

		await expect(run(layer)).rejects.toThrow(NOTE_ATTACHMENT_MESSAGE.NOT_FOUND);
		expect(parts.insert).not.toHaveBeenCalled();
	});
});
