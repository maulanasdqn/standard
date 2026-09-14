import { PERMISSION } from "@app/permissions";
import {
	roleCreateInputSchema,
	roleKeyInputSchema,
	roleListSchema,
	roleSchema,
	roleUpdateInputSchema,
} from "@app/schemas";
import { z } from "zod";
import { roleCreate } from "#/application/role/role-create.ts";
import { roleDelete } from "#/application/role/role-delete.ts";
import { roleGet } from "#/application/role/role-get.ts";
import { roleList } from "#/application/role/role-list.ts";
import { roleUpdate } from "#/application/role/role-update.ts";
import { permissionRequire } from "#/presentation/orpc/middleware.ts";
import { effectRun } from "#/presentation/orpc/run-effect.ts";
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PATH } from "#/presentation/route-paths.ts";

export const roleRouterBuild = () => ({
	list: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.ROLES })
		.output(roleListSchema)
		.handler(({ context }) => effectRun(context.runtime, roleList())),

	get: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.ROLE })
		.input(roleKeyInputSchema)
		.output(roleSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, roleGet(input)),
		),

	create: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.ROLES })
		.input(roleCreateInputSchema)
		.output(roleSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, roleCreate(input, context.session!.user.id)),
		),

	update: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.PATCH, path: ROUTE_PATH.ROLE })
		.input(roleUpdateInputSchema)
		.output(roleSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, roleUpdate(input, context.session!.user.id)),
		),

	remove: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.ROLE })
		.input(roleKeyInputSchema)
		.output(z.object({ key: z.string() }))
		.handler(({ input, context }) =>
			effectRun(context.runtime, roleDelete(input, context.session!.user.id)),
		),
});
