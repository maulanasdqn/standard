import { NOTE_MESSAGE } from "@app/messages";
import type { TNote, TNoteIdInput } from "@app/schemas";
import { Effect } from "effect";
import { toNoteDto } from "#/note/application/to-note-dto.ts";
import { ENotFound, type EDatabase } from "#/shared/errors.ts";
import { NoteRepo, type TNoteRepoId } from "#/note/domain/note.ts";
import type { TOwnershipActor } from "#/shared/authorization/owned-entity.ts";

export const noteGet = Effect.fn("noteGet")(function* (
	{ id }: TNoteIdInput,
	actor: TOwnershipActor,
): Effect.fn.Return<TNote, ENotFound | EDatabase, TNoteRepoId> {
	const noteRepo = yield* NoteRepo;
	const row = yield* noteRepo.findById(id, actor);

	if (row === null) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	return toNoteDto(row);
});
