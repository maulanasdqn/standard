import type { TNoteCreateInput, TNote } from "@app/schemas";
import { Effect } from "effect";
import { toNoteDto } from "#/note/application/to-note-dto.ts";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { EDatabase } from "#/shared/errors.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { NoteRepo, type TNoteRepoId } from "#/note/domain/note.ts";
import type { TOwnershipActor } from "#/shared/authorization/owned-entity.ts";

export const noteCreate = Effect.fn("noteCreate")(function* (
	input: TNoteCreateInput,
	actor: TOwnershipActor,
): Effect.fn.Return<TNote, EDatabase, TNoteRepoId | TActivityRecorderId> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRecorder;

	const row = yield* noteRepo.create(input, actor.id);
	yield* activityRepo.insert({
		actorId: actor.id,
		action: ACTIVITY_ACTION.NOTE_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.NOTE,
		resourceId: row.id,
	});

	return toNoteDto(row);
});
