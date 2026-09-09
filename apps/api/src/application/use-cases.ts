import {
	buildNoteUseCases,
	type TNoteUseCases,
} from "#/application/note/build-note-use-cases.ts";
import type { IDependencies } from "#/application/use-cases-deps.ts";

export type TUseCases = {
	note: TNoteUseCases;
};

export const buildUseCases = (deps: IDependencies): TUseCases => ({
	note: buildNoteUseCases(deps),
});
