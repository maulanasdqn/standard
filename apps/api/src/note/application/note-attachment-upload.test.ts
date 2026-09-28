import { ACTIVITY_ACTION } from "@app/activity";
import { NOTE_ATTACHMENT_MESSAGE, NOTE_MESSAGE } from "@app/messages";
import { ROLE } from "@app/permissions";
import {
	NOTE_ATTACHMENT_CONTENT_TYPE,
	NOTE_ATTACHMENT_MAX_PER_NOTE,
	type TNoteAttachment,
} from "@app/schemas";
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
import { noteAttachmentUpload } from "#/note/application/note-attachment-upload.ts";
import type { TNoteRow } from "#/note/domain/note.ts";
import type { TDb } from "#/platform/db/client.ts";
import { DbService } from "#/platform/db/db-service.ts";
import { ActivityRecorder } from "#/shared/activity-recorder.ts";
import { EStorage } from "#/shared/errors.ts";

const ACTOR = { id: AUTHOR_ID, role: ROLE.MEMBER };
const PNG_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00];
const TEXT_BYTES = [0x68, 0x69];

const dbFake = {
	transaction: async <A>(run: (tx: TDb) => Promise<A>): Promise<A> =>
		run(dbFake),
} as unknown as TDb;

const fileOf = (bytes: readonly number[]): File =>
	new File([new Uint8Array(bytes)], attachmentRow.fileName, {
		type: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
	});

const harness = (held: number) => {
	const parts = {
		findNote: succeeding<TNoteRow | null>(noteRow),
		countByNote: succeeding(held),
		noteLock: succeeding(true),
		reapClaim: succeeding(undefined),
		reapRelease: succeeding(true),
		create: succeeding(attachmentRow),
		put: succeeding(undefined),
		url: succeeding(SIGNED_URL),
		insert: succeeding(undefined),
	};

	const layer = Layer.mergeAll(
		noteRepoLayer({ findById: parts.findNote }),
		attachmentRepoLayer({
			countByNote: parts.countByNote,
			noteLock: parts.noteLock,
			create: parts.create,
			reapClaim: parts.reapClaim,
			reapRelease: parts.reapRelease,
		}),
		attachmentStoreLayer({ put: parts.put, url: parts.url }),
		Layer.succeed(
			ActivityRecorder,
			ActivityRecorder.of({ insert: parts.insert }),
		),
		Layer.succeed(DbService, DbService.of({ db: dbFake })),
	);

	return { parts, layer };
};

type THarness = ReturnType<typeof harness>;

const run = (
	layer: THarness["layer"],
	bytes: readonly number[] = PNG_BYTES,
): Promise<TNoteAttachment> =>
	Effect.runPromise(
		noteAttachmentUpload({ noteId: NOTE_ID, file: fileOf(bytes) }, ACTOR).pipe(
			Effect.provide(layer),
		),
	);

describe("noteAttachmentUpload", () => {
	it("stores the object under its sniffed type, records the row, and logs the activity", async (): Promise<void> => {
		const { parts, layer } = harness(0);

		const result = await run(layer);

		expect(result.url).toBe(SIGNED_URL);
		expect(parts.put).toHaveBeenCalledWith(
			expect.stringContaining(`notes/${NOTE_ID}/`),
			expect.any(Uint8Array),
			NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
		);
		expect(parts.create).toHaveBeenCalledWith(
			expect.objectContaining({
				noteId: NOTE_ID,
				byteSize: PNG_BYTES.length,
				contentType: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
			}),
		);
		expect(parts.insert).toHaveBeenCalledWith(
			expect.objectContaining({
				action: ACTIVITY_ACTION.NOTE_ATTACHMENT_UPLOAD,
				resourceId: attachmentRow.id,
			}),
		);
	});

	it("claims the key before the object is written, so a crash cannot orphan it", async (): Promise<void> => {
		const { parts, layer } = harness(0);

		await run(layer);

		expect(parts.reapClaim.mock.invocationCallOrder[0]).toBeLessThan(
			parts.put.mock.invocationCallOrder[0] ?? 0,
		);
	});

	it("locks the note and counts again before inserting", async (): Promise<void> => {
		const { parts, layer } = harness(0);

		await run(layer);

		expect(parts.noteLock).toHaveBeenCalledWith(NOTE_ID);
		expect(parts.countByNote).toHaveBeenCalledTimes(2);
		expect(parts.noteLock.mock.invocationCallOrder[0]).toBeLessThan(
			parts.create.mock.invocationCallOrder[0] ?? 0,
		);
	});

	it("refuses an upload once the note holds the maximum", async (): Promise<void> => {
		const { parts, layer } = harness(NOTE_ATTACHMENT_MAX_PER_NOTE);

		await expect(run(layer)).rejects.toThrow(NOTE_ATTACHMENT_MESSAGE.FULL);
		expect(parts.put).not.toHaveBeenCalled();
	});

	it("refuses the insert when a concurrent upload filled the note meanwhile", async (): Promise<void> => {
		const { parts, layer } = harness(0);
		parts.countByNote
			.mockReturnValueOnce(Effect.succeed(NOTE_ATTACHMENT_MAX_PER_NOTE - 1))
			.mockReturnValueOnce(Effect.succeed(NOTE_ATTACHMENT_MAX_PER_NOTE));

		await expect(run(layer)).rejects.toThrow(NOTE_ATTACHMENT_MESSAGE.FULL);
		expect(parts.create).not.toHaveBeenCalled();
	});

	it("refuses bytes that are not one of the allowed images, whatever the declared type", async (): Promise<void> => {
		const { parts, layer } = harness(0);

		await expect(run(layer, TEXT_BYTES)).rejects.toThrow(
			NOTE_ATTACHMENT_MESSAGE.NOT_AN_IMAGE,
		);
		expect(parts.reapClaim).not.toHaveBeenCalled();
		expect(parts.put).not.toHaveBeenCalled();
	});

	it("does not touch storage when the note is not the actor's", async (): Promise<void> => {
		const { parts, layer } = harness(0);
		parts.findNote.mockReturnValue(Effect.succeed(null));

		await expect(run(layer)).rejects.toThrow(NOTE_MESSAGE.NOT_FOUND);
		expect(parts.reapClaim).not.toHaveBeenCalled();
		expect(parts.put).not.toHaveBeenCalled();
	});

	it("fails without a row when the note was deleted while the object was written", async (): Promise<void> => {
		const { parts, layer } = harness(0);
		parts.noteLock.mockReturnValue(Effect.succeed(false));

		await expect(run(layer)).rejects.toThrow(NOTE_MESSAGE.NOT_FOUND);
		expect(parts.create).not.toHaveBeenCalled();
	});

	it("rolls back when the sweep took the claim before the row committed", async (): Promise<void> => {
		const { parts, layer } = harness(0);
		parts.reapRelease.mockReturnValue(Effect.succeed(false));

		const error = await Effect.runPromise(
			noteAttachmentUpload(
				{ noteId: NOTE_ID, file: fileOf(PNG_BYTES) },
				ACTOR,
			).pipe(Effect.provide(layer), Effect.flip),
		);

		expect(error).toBeInstanceOf(EStorage);
		expect(parts.insert).not.toHaveBeenCalled();
	});
});
