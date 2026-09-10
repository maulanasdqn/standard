import { activityRouterBuild } from "#/presentation/routers/activity.ts";
import { healthRouterBuild } from "#/presentation/routers/health.ts";
import { meRouterBuild } from "#/presentation/routers/me.ts";
import { noteRouterBuild } from "#/presentation/routers/note.ts";
import { permissionRouterBuild } from "#/presentation/routers/permission.ts";
import { roleRouterBuild } from "#/presentation/routers/role.ts";
import { userRouterBuild } from "#/presentation/routers/user.ts";

export const routerBuild = () => ({
	health: healthRouterBuild(),
	me: meRouterBuild(),
	note: noteRouterBuild(),
	user: userRouterBuild(),
	role: roleRouterBuild(),
	permission: permissionRouterBuild(),
	activity: activityRouterBuild(),
});

export type TAppRouter = ReturnType<typeof routerBuild>;
