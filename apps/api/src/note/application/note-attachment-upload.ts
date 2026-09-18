import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { NOTE_ATTACHMENT_MESSAGE, NOTE_MESSAGE } from "@app/messages";
import {
	NOTE_ATTACHMENT_MAX_PER_NOTE,
	type TNoteAttachment,
	type TNoteAttachmentContentType,
	type TNoteAttachmentUploadInput,
} from "@app/schemas";
import { Effect } from "effect";
import { toNoteAttachmentDto } from "#/note/application/to-note-attachment-dto.ts";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRepoId,
} from "#/note/domain/note-attachment.ts";
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

		const held = yield* attachmentRepo.countByNote(input.noteId);

		if (held >= NOTE_ATTACHMENT_MAX_PER_NOTE) {
			return yield* new EBadRequest({
				message: NOTE_ATTACHMENT_MESSAGE.FULL,
			});
		}

		const storageKey = storageKeyFor(input.noteId);
		const reapAfter = new Date(Date.now() + NOTE_ATTACHMENT_REAP_GRACE_MS);

		yield* attachmentRepo.reapClaim(storageKey, reapAfter);

		const body = yield* bytesOf(input.file);

		yield* store.put(storageKey, body, input.file.type);

		const row = yield* transactional(
			Effect.gen(function* () {
				const created = yield* attachmentRepo.create({
					noteId: input.noteId,
					storageKey,
					fileName: input.file.name,
					contentType: input.file.type as TNoteAttachmentContentType,
					byteSize: input.file.size,
				});

				yield* attachmentRepo.reapRelease(storageKey);
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

		const url = yield* store.url(storageKey);

		return toNoteAttachmentDto(row, url);
	},
);
