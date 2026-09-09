import type { IDependencies } from "#/application/use-cases-deps.ts";
import { makeCreateNote } from "#/application/note/create-note.ts";
import { makeDeleteNote } from "#/application/note/delete-note.ts";
import { makeGetNote } from "#/application/note/get-note.ts";
import { makeListNotes } from "#/application/note/list-notes.ts";
import { makeUpdateNote } from "#/application/note/update-note.ts";

export const buildNoteUseCases = (deps: IDependencies) => ({
	list: makeListNotes(deps),
	get: makeGetNote(deps),
	create: makeCreateNote(deps),
	update: makeUpdateNote(deps),
	remove: makeDeleteNote(deps),
});

export type TNoteUseCases = ReturnType<typeof buildNoteUseCases>;
