import type { TNoteListInput, TNoteList } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import type { EDatabase } from "#/shared/errors.ts";
import { toNoteDto } from "#/note/application/to-note-dto.ts";
import { NoteRepo, type TNoteRepoId } from "#/note/domain/note.ts";

export const noteList = Effect.fn("noteList")(function* (
	input: TNoteListInput,
): Effect.fn.Return<TNoteList, EDatabase, TNoteRepoId> {
	const noteRepo = yield* NoteRepo;
	const { items, total } = yield* noteRepo.list(input);
	return {
		items: A.map(items, toNoteDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
