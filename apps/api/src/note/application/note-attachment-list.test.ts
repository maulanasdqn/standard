import { NOTE_MESSAGE } from "@app/messages";
import { ROLE } from "@app/permissions";
import type { TNoteAttachmentList } from "@app/schemas";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import {
	AUTHOR_ID,
	attachmentRepoLayer,
	attachmentRow,
	attachmentStoreLayer,
	NOTE_ID,
	noteRepoLayer,
	noteRow,
	SIGNED_URL,
	succeeding,
} from "#/note/application/note-attachment-fakes.test-support.ts";
import { noteAttachmentList } from "#/note/application/note-attachment-list.ts";
import type { TNoteRow } from "#/note/domain/note.ts";

const ACTOR = { id: AUTHOR_ID, role: ROLE.MEMBER };

const harness = () => {
	const parts = {
		findNote: succeeding<TNoteRow | null>(noteRow),
		listByNote: succeeding([attachmentRow]),
		url: succeeding(SIGNED_URL),
	};

	const layer = Layer.mergeAll(
		noteRepoLayer({ findById: parts.findNote }),
		attachmentRepoLayer({ listByNote: parts.listByNote }),
		attachmentStoreLayer({ url: parts.url }),
	);

	return { parts, layer };
};

type THarness = ReturnType<typeof harness>;

const run = (layer: THarness["layer"]): Promise<TNoteAttachmentList> =>
	Effect.runPromise(
		noteAttachmentList({ noteId: NOTE_ID }, ACTOR).pipe(Effect.provide(layer)),
	);

describe("noteAttachmentList", () => {
	it("signs a read link for each row under its stored type", async (): Promise<void> => {
		const { parts, layer } = harness();

		const result = await run(layer);

		expect(result).toEqual([
			expect.objectContaining({ id: attachmentRow.id, url: SIGNED_URL }),
		]);
		expect(parts.url).toHaveBeenCalledWith(
			attachmentRow.storageKey,
			attachmentRow.contentType,
		);
	});

	it("keeps listing a row whose stored file name the wire schema would refuse", async (): Promise<void> => {
		const { parts, layer } = harness();
		parts.listByNote.mockReturnValue(
			Effect.succeed([{ ...attachmentRow, fileName: "" }]),
		);

		await expect(run(layer)).resolves.toHaveLength(1);
	});

	it("answers not found for someone else's note, without signing anything", async (): Promise<void> => {
		const { parts, layer } = harness();
		parts.findNote.mockReturnValue(Effect.succeed(null));

		await expect(run(layer)).rejects.toThrow(NOTE_MESSAGE.NOT_FOUND);
		expect(parts.listByNote).not.toHaveBeenCalled();
		expect(parts.url).not.toHaveBeenCalled();
	});
});
