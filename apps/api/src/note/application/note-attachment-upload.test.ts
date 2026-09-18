import { ACTIVITY_ACTION } from "@app/activity";
import { NOTE_ATTACHMENT_MESSAGE } from "@app/messages";
import { ROLE } from "@app/permissions";
import {
	NOTE_ATTACHMENT_CONTENT_TYPE,
	NOTE_ATTACHMENT_MAX_PER_NOTE,
	type TNoteAttachment,
} from "@app/schemas";
import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { noteAttachmentUpload } from "#/note/application/note-attachment-upload.ts";
import { NoteAttachmentStore } from "#/note/domain/note-attachment-store.ts";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRow,
} from "#/note/domain/note-attachment.ts";
import { NoteRepo, type TNoteRow } from "#/note/domain/note.ts";
import type { TDb } from "#/platform/db/client.ts";
import { DbService } from "#/platform/db/db-service.ts";
import { ActivityRecorder } from "#/shared/activity-recorder.ts";

const AUTHOR_ID = "22222222-2222-4222-8222-222222222222";
const ACTOR = { id: AUTHOR_ID, role: ROLE.MEMBER };
const NOTE_ID = "11111111-1111-4111-8111-111111111111";
const AT = new Date("2026-01-01T00:00:00Z");
const SIGNED_URL = "https://bucket.test/signed";

const noteRow: TNoteRow = {
	id: NOTE_ID,
	title: "Title",
	body: "Body",
	authorId: AUTHOR_ID,
	version: 1,
	createdAt: AT,
	updatedAt: AT,
};

const attachmentRow: TNoteAttachmentRow = {
	id: "33333333-3333-4333-8333-333333333333",
	noteId: NOTE_ID,
	storageKey: `notes/${NOTE_ID}/object`,
	fileName: "pixel.png",
	contentType: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
	byteSize: 3,
	createdAt: AT,
	updatedAt: AT,
};

const dbFake = {
	transaction: async <A>(run: (tx: TDb) => Promise<A>): Promise<A> =>
		run(dbFake),
} as unknown as TDb;

const fileFake = (): File =>
	new File([new Uint8Array([1, 2, 3])], attachmentRow.fileName, {
		type: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
	});

const succeed = <A>(value: A) => vi.fn().mockReturnValue(Effect.succeed(value));

const harness = (held: number) => {
	const parts = {
		findNote: succeed<TNoteRow | null>(noteRow),
		countByNote: succeed(held),
		reapClaim: succeed(undefined),
		reapRelease: succeed(undefined),
		create: succeed(attachmentRow),
		put: succeed(undefined),
		url: succeed(SIGNED_URL),
		insert: succeed(undefined),
	};

	const layer = Layer.mergeAll(
		Layer.succeed(
			NoteRepo,
			NoteRepo.of({
				list: vi.fn(),
				findById: parts.findNote,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
			}),
		),
		Layer.succeed(
			NoteAttachmentRepo,
			NoteAttachmentRepo.of({
				listByNote: vi.fn(),
				countByNote: parts.countByNote,
				findById: vi.fn(),
				create: parts.create,
				remove: vi.fn(),
				reapClaim: parts.reapClaim,
				reapClaimForNote: vi.fn(),
				reapRelease: parts.reapRelease,
				reapDue: vi.fn(),
				reapDone: vi.fn(),
			}),
		),
		Layer.succeed(
			NoteAttachmentStore,
			NoteAttachmentStore.of({
				put: parts.put,
				remove: vi.fn(),
				url: parts.url,
			}),
		),
		Layer.succeed(
			ActivityRecorder,
			ActivityRecorder.of({ insert: parts.insert }),
		),
		Layer.succeed(DbService, DbService.of({ db: dbFake })),
	);

	return { parts, layer };
};

type THarness = ReturnType<typeof harness>;

const run = (layer: THarness["layer"]): Promise<TNoteAttachment> =>
	Effect.runPromise(
		noteAttachmentUpload({ noteId: NOTE_ID, file: fileFake() }, ACTOR).pipe(
			Effect.provide(layer),
		),
	);

describe("noteAttachmentUpload", () => {
	it("stores the object, records the row, and logs the activity", async (): Promise<void> => {
		const { parts, layer } = harness(0);

		const result = await run(layer);

		expect(result.url).toBe(SIGNED_URL);
		expect(parts.put).toHaveBeenCalledWith(
			expect.stringContaining(`notes/${NOTE_ID}/`),
			expect.any(Uint8Array),
			NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
		);
		expect(parts.create).toHaveBeenCalledWith(
			expect.objectContaining({ noteId: NOTE_ID, byteSize: 3 }),
		);
		expect(parts.reapRelease).toHaveBeenCalledTimes(1);
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

	it("refuses an upload once the note holds the maximum", async (): Promise<void> => {
		const { parts, layer } = harness(NOTE_ATTACHMENT_MAX_PER_NOTE);

		await expect(run(layer)).rejects.toThrow(NOTE_ATTACHMENT_MESSAGE.FULL);
		expect(parts.put).not.toHaveBeenCalled();
	});

	it("does not touch storage when the note is not the actor's", async (): Promise<void> => {
		const { parts, layer } = harness(0);
		parts.findNote.mockReturnValue(Effect.succeed(null));

		await expect(run(layer)).rejects.toThrow();
		expect(parts.reapClaim).not.toHaveBeenCalled();
		expect(parts.put).not.toHaveBeenCalled();
	});
});
