import { NOTE_MESSAGE } from "@app/messages";
import type { TNote, TNoteUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import {
	ACTIVITY_ACTION,
	ACTIVITY_ENTITY_TYPE,
} from "#/application/shared/activity.ts";
import { ENotFound, type EDatabase } from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { NoteRepo } from "#/infrastructure/db/repositories/note-repository.ts";

export const noteUpdate = Effect.fn("noteUpdate")(function* (
	input: TNoteUpdateInput,
	actorId: string,
): Effect.fn.Return<TNote, ENotFound | EDatabase, NoteRepo | ActivityRepo> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRepo;

	const updated = yield* noteRepo.update(input);

	if (updated === null) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.NOTE_UPDATE,
		entityType: ACTIVITY_ENTITY_TYPE.NOTE,
		entityId: updated.id,
	});

	return toNoteDto(updated);
});
