import { NOTE_MESSAGE } from "@app/messages";
import type { TNoteIdInput } from "@app/schemas";
import { Effect } from "effect";
import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetails,
} from "@app/activity";
import { ENotFound, type EDatabase } from "#/shared/errors.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { NoteRepo, type TNoteRepoId } from "#/note/domain/note.ts";
import type { TOwnershipActor } from "#/shared/authorization/owned-entity.ts";

export const noteDelete = Effect.fn("noteDelete")(function* (
	{ id }: TNoteIdInput,
	actor: TOwnershipActor,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EDatabase,
	TNoteRepoId | TActivityRecorderId
> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRecorder;
	const existing = yield* noteRepo.findById(id, actor);

	if (existing === null) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	const removed = yield* noteRepo.remove(id, actor);

	if (!removed) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId: actor.id,
		action: ACTIVITY_ACTION.NOTE_DELETE,
		resourceType: ACTIVITY_RESOURCE_TYPE.NOTE,
		resourceId: id,
		metadata: activityDetails({ [ACTIVITY_DETAIL.TITLE]: existing.title }),
	});

	return { id };
});
