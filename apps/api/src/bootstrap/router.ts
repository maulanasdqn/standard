import { activityModule } from "#/activity/index.ts";
import { authModule } from "#/auth/index.ts";
import { healthModule } from "#/health/index.ts";
import { noteModule } from "#/note/index.ts";
import { permissionModule } from "#/permission/index.ts";
import { roleModule } from "#/role/index.ts";
import { userModule } from "#/user/index.ts";

const routerCreate = () => ({
	health: healthModule.routerBuild(),
	me: authModule.routerBuild(),
	note: noteModule.routerBuild(),
	user: userModule.routerBuild(),
	role: roleModule.routerBuild(),
	permission: permissionModule.routerBuild(),
	activity: activityModule.routerBuild(),
});

export type TAppRouter = ReturnType<typeof routerCreate>;

export const routerBuild = (): TAppRouter => routerCreate();
