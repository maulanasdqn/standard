import { healthRouterBuild } from "#/presentation/routers/health.ts";
import { meRouterBuild } from "#/presentation/routers/me.ts";
import { noteRouterBuild } from "#/presentation/routers/note.ts";

export const routerBuild = () => ({
	health: healthRouterBuild(),
	me: meRouterBuild(),
	note: noteRouterBuild(),
});

export type TAppRouter = ReturnType<typeof routerBuild>;
