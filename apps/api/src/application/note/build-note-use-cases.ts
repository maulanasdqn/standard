import type { IDependencies } from "#/application/use-cases-deps.ts";
import {
	makeCreateNote,
	type TCreateNote,
} from "#/application/note/create-note.ts";
import {
	makeDeleteNote,
	type TDeleteNote,
} from "#/application/note/delete-note.ts";
import { makeGetNote, type TGetNote } from "#/application/note/get-note.ts";
import {
	makeListNotes,
	type TListNotes,
} from "#/application/note/list-notes.ts";
import {
	makeUpdateNote,
	type TUpdateNote,
} from "#/application/note/update-note.ts";

export type TNoteUseCases = {
	list: TListNotes;
	get: TGetNote;
	create: TCreateNote;
	update: TUpdateNote;
	remove: TDeleteNote;
};

export const buildNoteUseCases = (deps: IDependencies): TNoteUseCases => ({
	list: makeListNotes(deps),
	get: makeGetNote(deps),
	create: makeCreateNote(deps),
	update: makeUpdateNote(deps),
	remove: makeDeleteNote(deps),
});
