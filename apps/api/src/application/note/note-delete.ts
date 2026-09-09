import { NOTE_MESSAGE } from "@app/messages";
import type { TNoteIdInput } from "@app/schemas";
import { Effect } from "effect";
import { ENotFound, type EDatabase } from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { NoteRepo } from "#/infrastructure/db/repositories/note-repository.ts";

export const noteDelete = Effect.fn("noteDelete")(function* (
	{ id }: TNoteIdInput,
	actorId: string,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EDatabase,
	NoteRepo | ActivityRepo
> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRepo;

	const removed = yield* noteRepo.remove(id);

	if (!removed) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: "note.delete",
		entityType: "note",
		entityId: id,
	});

	return { id };
});
