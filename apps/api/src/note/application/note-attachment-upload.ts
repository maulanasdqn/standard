import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { NOTE_ATTACHMENT_MESSAGE, NOTE_MESSAGE } from "@app/messages";
import {
	NOTE_ATTACHMENT_MAX_PER_NOTE,
	type TNoteAttachment,
	type TNoteAttachmentUploadInput,
} from "@app/schemas";
import { Effect } from "effect";
import { toNoteAttachmentDto } from "#/note/application/to-note-attachment-dto.ts";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRepoId,
} from "#/note/domain/note-attachment.ts";
import { noteAttachmentContentTypeSniff } from "#/note/domain/note-attachment-sniff.ts";
import {
	NOTE_ATTACHMENT_REAP_GRACE_MS,
	NoteAttachmentStore,
	type TNoteAttachmentStoreId,
} from "#/note/domain/note-attachment-store.ts";
import { NoteRepo, type TNoteRepoId } from "#/note/domain/note.ts";
import { transactional } from "#/platform/db/transaction.ts";
import type { TDbServiceId } from "#/platform/db/db-service.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { TOwnershipActor } from "#/shared/authorization/owned-entity.ts";
import {
	EBadRequest,
	ENotFound,
	EStorage,
	type EDatabase,
} from "#/shared/errors.ts";

export const NOTE_ATTACHMENT_CLAIM_LOST =
	"note attachment claim expired before the row was committed";

const storageKeyFor = (noteId: string): string =>
	`notes/${noteId}/${crypto.randomUUID()}`;

const bytesOf = (
	file: File,
): Effect.Effect<Uint8Array<ArrayBuffer>, EStorage> =>
	Effect.tryPromise({
		try: async (): Promise<Uint8Array<ArrayBuffer>> =>
			new Uint8Array(await file.arrayBuffer()),
		catch: (cause) => new EStorage({ cause }),
	});

const roomRequire = Effect.fnUntraced(function* (
	noteId: string,
): Effect.fn.Return<void, EBadRequest | EDatabase, TNoteAttachmentRepoId> {
	const attachmentRepo = yield* NoteAttachmentRepo;
	const held = yield* attachmentRepo.countByNote(noteId);

	if (held >= NOTE_ATTACHMENT_MAX_PER_NOTE) {
		return yield* new EBadRequest({ message: NOTE_ATTACHMENT_MESSAGE.FULL });
	}
});

export const noteAttachmentUpload = Effect.fn("noteAttachmentUpload")(
	function* (
		input: TNoteAttachmentUploadInput,
		actor: TOwnershipActor,
	): Effect.fn.Return<
		TNoteAttachment,
		ENotFound | EBadRequest | EDatabase | EStorage,
		| TNoteRepoId
		| TNoteAttachmentRepoId
		| TNoteAttachmentStoreId
		| TActivityRecorderId
		| TDbServiceId
	> {
		const noteRepo = yield* NoteRepo;
		const attachmentRepo = yield* NoteAttachmentRepo;
		const store = yield* NoteAttachmentStore;
		const activityRepo = yield* ActivityRecorder;

		const note = yield* noteRepo.findById(input.noteId, actor);

		if (note === null) {
			return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
		}

		yield* roomRequire(input.noteId);

		const body = yield* bytesOf(input.file);
		const contentType = noteAttachmentContentTypeSniff(body);

		if (contentType === null) {
			return yield* new EBadRequest({
				message: NOTE_ATTACHMENT_MESSAGE.NOT_AN_IMAGE,
			});
		}

		const storageKey = storageKeyFor(input.noteId);

		yield* attachmentRepo.reapClaim(storageKey, NOTE_ATTACHMENT_REAP_GRACE_MS);
		yield* store.put(storageKey, body, contentType);

		const row = yield* transactional(
			Effect.gen(function* () {
				const present = yield* attachmentRepo.noteLock(input.noteId);

				if (!present) {
					return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
				}

				yield* roomRequire(input.noteId);

				const created = yield* attachmentRepo.create({
					noteId: input.noteId,
					storageKey,
					fileName: input.file.name,
					contentType,
					byteSize: body.byteLength,
				});

				const released = yield* attachmentRepo.reapRelease(storageKey);

				if (!released) {
					return yield* new EStorage({
						cause: new Error(NOTE_ATTACHMENT_CLAIM_LOST),
					});
				}

				yield* activityRepo.insert({
					actorId: actor.id,
					action: ACTIVITY_ACTION.NOTE_ATTACHMENT_UPLOAD,
					resourceType: ACTIVITY_RESOURCE_TYPE.NOTE_ATTACHMENT,
					resourceId: created.id,
					metadata: { noteId: input.noteId },
				});

				return created;
			}),
		);

		const url = yield* store.url(storageKey, row.contentType);

		return toNoteAttachmentDto(row, url);
	},
);
