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

export const roleRouterBuild = () => ({
	list: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "GET", path: "/roles" })
		.output(roleListSchema)
		.handler(() => effectRun(roleList())),

	get: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "GET", path: "/roles/{key}" })
		.input(roleKeyInputSchema)
		.output(roleSchema)
		.handler(({ input }) => effectRun(roleGet(input))),

	create: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "POST", path: "/roles" })
		.input(roleCreateInputSchema)
		.output(roleSchema)
		.handler(({ input, context }) =>
			effectRun(roleCreate(input, context.session!.user.id)),
		),

	update: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "PATCH", path: "/roles/{key}" })
		.input(roleUpdateInputSchema)
		.output(roleSchema)
		.handler(({ input, context }) =>
			effectRun(roleUpdate(input, context.session!.user.id)),
		),

	remove: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "DELETE", path: "/roles/{key}" })
		.input(roleKeyInputSchema)
		.output(z.object({ key: z.string() }))
		.handler(({ input, context }) =>
			effectRun(roleDelete(input, context.session!.user.id)),
		),
});
