import type { TNoteCreateInput, TNote } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import type { EDatabase } from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { NoteRepo } from "#/infrastructure/db/repositories/note-repository.ts";

export const noteCreate = Effect.fn("noteCreate")(function* (
	input: TNoteCreateInput,
	authorId: string,
): Effect.fn.Return<TNote, EDatabase, NoteRepo | ActivityRepo> {
	const noteRepo = yield* NoteRepo;
	const activityRepo = yield* ActivityRepo;

	const row = yield* noteRepo.create(D.merge(input, { authorId }));
	yield* activityRepo.insert({
		actorId: authorId,
		action: "note.create",
		entityType: "note",
		entityId: row.id,
	});

	return toNoteDto(row);
});
