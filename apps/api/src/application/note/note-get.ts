import { NOTE_MESSAGE } from "@app/messages";
import type { TNote, TNoteIdInput } from "@app/schemas";
import { Effect } from "effect";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import { ENotFound, type EDatabase } from "#/domain/shared/errors.ts";
import { NoteRepo, type TNoteRepoId } from "#/domain/note/note.ts";

export const noteGet = Effect.fn("noteGet")(function* ({
	id,
}: TNoteIdInput): Effect.fn.Return<TNote, ENotFound | EDatabase, TNoteRepoId> {
	const noteRepo = yield* NoteRepo;
	const row = yield* noteRepo.findById(id);

	if (row === null) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	return toNoteDto(row);
});
