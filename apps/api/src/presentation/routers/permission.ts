import { PERMISSION } from "@app/permissions";
import { permissionListSchema } from "@app/schemas";
import { permissionList } from "#/application/permission/permission-list.ts";
import { permissionRequire } from "#/presentation/orpc/middleware.ts";
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PATH } from "#/presentation/route-paths.ts";

export const permissionRouterBuild = () => ({
	list: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PERMISSIONS })
		.output(permissionListSchema)
		.handler(() => permissionList()),
});
