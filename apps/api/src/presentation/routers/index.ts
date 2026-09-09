import { buildHealthRouter } from "#/presentation/routers/health.ts";
import { buildMeRouter } from "#/presentation/routers/me.ts";
import { buildNoteRouter } from "#/presentation/routers/note.ts";

export const buildRouter = () => ({
	health: buildHealthRouter(),
	me: buildMeRouter(),
	note: buildNoteRouter(),
});

export type TAppRouter = ReturnType<typeof buildRouter>;
