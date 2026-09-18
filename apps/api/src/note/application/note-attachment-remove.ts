import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { NOTE_ATTACHMENT_MESSAGE } from "@app/messages";
import type { TNoteAttachmentIdInput } from "@app/schemas";
import { Effect } from "effect";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRepoId,
} from "#/note/domain/note-attachment.ts";
import { NoteRepo, type TNoteRepoId } from "#/note/domain/note.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { TOwnershipActor } from "#/shared/authorization/owned-entity.ts";
import { ENotFound, type EDatabase } from "#/shared/errors.ts";

export const noteAttachmentRemove = Effect.fn("noteAttachmentRemove")(
	function* (
		{ id }: TNoteAttachmentIdInput,
		actor: TOwnershipActor,
	): Effect.fn.Return<
		{ id: string },
		ENotFound | EDatabase,
		TNoteRepoId | TNoteAttachmentRepoId | TActivityRecorderId
	> {
		const noteRepo = yield* NoteRepo;
		const attachmentRepo = yield* NoteAttachmentRepo;
		const activityRepo = yield* ActivityRecorder;

		const row = yield* attachmentRepo.findById(id);

		if (row === null) {
			return yield* new ENotFound({
				message: NOTE_ATTACHMENT_MESSAGE.NOT_FOUND,
			});
		}

		const note = yield* noteRepo.findById(row.noteId, actor);

		if (note === null) {
			return yield* new ENotFound({
				message: NOTE_ATTACHMENT_MESSAGE.NOT_FOUND,
			});
		}

		yield* attachmentRepo.reapClaim(row.storageKey, new Date());
		yield* attachmentRepo.remove(id);
		yield* activityRepo.insert({
			actorId: actor.id,
			action: ACTIVITY_ACTION.NOTE_ATTACHMENT_DELETE,
			resourceType: ACTIVITY_RESOURCE_TYPE.NOTE_ATTACHMENT,
			resourceId: id,
			metadata: { noteId: row.noteId },
		});

		return { id };
	},
);
