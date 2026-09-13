import type { TNoteCreateInput, TNote } from "@app/schemas";
import { Effect } from "effect";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import { ACTIVITY_ACTION, ACTIVITY_ENTITY_TYPE } from "@app/activity";
import type { EDatabase } from "#/domain/shared/errors.ts";
import { ActivityRepo } from "#/domain/activity/activity.ts";
import { NoteRepo } from "#/domain/note/note.ts";

export const noteCreate = Effect.fn("noteCreate")(function* (
	input: TNoteCreateInput,
	authorId: string,
): Effect.fn.Return<TNote, EDatabase, NoteRepo | ActivityRepo> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRepo;

	const row = yield* noteRepo.create(input, authorId);
	yield* activityRepo.insert({
		actorId: authorId,
		action: ACTIVITY_ACTION.NOTE_CREATE,
		entityType: ACTIVITY_ENTITY_TYPE.NOTE,
		entityId: row.id,
	});

	return toNoteDto(row);
});
