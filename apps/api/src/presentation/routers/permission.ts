import { PERMISSION } from "@app/permissions";
import { permissionListSchema } from "@app/schemas";
import { permissionList } from "#/application/permission/permission-list.ts";
import { permissionRequire } from "#/presentation/orpc/middleware.ts";

export const permissionRouterBuild = () => ({
	list: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "GET", path: "/permissions" })
		.output(permissionListSchema)
		.handler(() => permissionList()),
});
