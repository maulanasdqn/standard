import { buildNoteUseCases } from "#/application/note/build-note-use-cases.ts";
import type { IDependencies } from "#/application/use-cases-deps.ts";

export const buildUseCases = (deps: IDependencies) => ({
	note: buildNoteUseCases(deps),
});

export type TUseCases = ReturnType<typeof buildUseCases>;
