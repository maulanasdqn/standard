import { NOTE_MESSAGE } from "@app/messages";
import {
	NOTE_FIELD,
	type TNote,
	type TNoteField,
	type TNoteUpdateInput,
} from "@app/schemas";
import { A, D } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toNoteDto } from "#/note/application/to-note-dto.ts";
import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetailList,
	activityDetails,
	type TActivityDetails,
} from "@app/activity";
import { EConflict, ENotFound, type EDatabase } from "#/shared/errors.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	NoteRepo,
	type TNoteRepoId,
	type TNoteRow,
} from "#/note/domain/note.ts";
import type { TOwnershipActor } from "#/shared/authorization/owned-entity.ts";

const updateDetails = (previous: TNoteRow, next: TNoteRow): TActivityDetails =>
	activityDetails({
		[ACTIVITY_DETAIL.TITLE]: next.title,
		[ACTIVITY_DETAIL.CHANGED_FIELDS]: activityDetailList(
			A.filter(
				D.values(NOTE_FIELD),
				(field: TNoteField): boolean => previous[field] !== next[field],
			),
		),
	});

export const noteUpdate = Effect.fn("noteUpdate")(function* (
	input: TNoteUpdateInput,
	actor: TOwnershipActor,
): Effect.fn.Return<
	TNote,
	ENotFound | EConflict | EDatabase,
	TNoteRepoId | TActivityRecorderId
> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRecorder;
	const previous = yield* noteRepo.findById(input.id, actor);

	if (previous === null) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	const updated = yield* noteRepo.update(input, actor);

	if (updated === null) {
		const current = yield* noteRepo.findById(input.id, actor);

		if (current === null) {
			return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
		}

		return yield* new EConflict({ message: NOTE_MESSAGE.CONFLICT });
	}

	yield* activityRepo.insert({
		actorId: actor.id,
		action: ACTIVITY_ACTION.NOTE_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.NOTE,
		resourceId: updated.id,
		metadata: updateDetails(previous, updated),
	});

	return toNoteDto(updated);
});
