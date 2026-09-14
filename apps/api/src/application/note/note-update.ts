import { NOTE_MESSAGE } from "@app/messages";
import type { TNote, TNoteUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ENotFound, type EDatabase } from "#/domain/shared/errors.ts";
import {
	ActivityRepo,
	type TActivityRepoId,
} from "#/domain/activity/activity.ts";
import { NoteRepo, type TNoteRepoId } from "#/domain/note/note.ts";

export const noteUpdate = Effect.fn("noteUpdate")(function* (
	input: TNoteUpdateInput,
	actorId: string,
): Effect.fn.Return<
	TNote,
	ENotFound | EDatabase,
	TNoteRepoId | TActivityRepoId
> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRepo;

	const updated = yield* noteRepo.update(input);

	if (updated === null) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.NOTE_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.NOTE,
		resourceId: updated.id,
	});

	return toNoteDto(updated);
});
