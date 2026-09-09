import type { TNoteListInput, TNoteList } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import type { EDatabase } from "#/application/shared/errors.ts";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import { NoteRepo } from "#/infrastructure/db/repositories/note-repository.ts";

export const noteList = Effect.fn("noteList")(function* (
	input: TNoteListInput,
): Effect.fn.Return<TNoteList, EDatabase, NoteRepo> {
	const noteRepo = yield* NoteRepo;
	const { items, total } = yield* noteRepo.list(input);
	return {
		items: A.map(items, toNoteDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
