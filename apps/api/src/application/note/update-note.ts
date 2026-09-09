import { NOTE_MESSAGE } from "@app/messages";
import type { TNote, TUpdateNoteInput } from "@app/schemas";
import { Effect } from "effect";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import { ENotFound, type EDatabase } from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { NoteRepo } from "#/infrastructure/db/repositories/note-repository.ts";

export const updateNote = Effect.fn("updateNote")(function* (
	{ id, ...patch }: TUpdateNoteInput,
	actorId: string,
): Effect.fn.Return<TNote, ENotFound | EDatabase, NoteRepo | ActivityRepo> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRepo;

	const updated = yield* noteRepo.update(id, patch);

	if (updated === null) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: "note.update",
		entityType: "note",
		entityId: updated.id,
	});

	return toNoteDto(updated);
});
