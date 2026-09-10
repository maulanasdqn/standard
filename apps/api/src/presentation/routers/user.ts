import { PERMISSION } from "@app/permissions";
import {
	userCreateInputSchema,
	userIdInputSchema,
	userListInputSchema,
	userListSchema,
	userSchema,
	userUpdateInputSchema,
} from "@app/schemas";
import { z } from "zod";
import { userCreate } from "#/application/user/user-create.ts";
import { userDelete } from "#/application/user/user-delete.ts";
import { userGet } from "#/application/user/user-get.ts";
import { userList } from "#/application/user/user-list.ts";
import { userUpdate } from "#/application/user/user-update.ts";
import { permissionRequire } from "#/presentation/orpc/middleware.ts";
import { effectRun } from "#/presentation/orpc/run-effect.ts";

export const userRouterBuild = () => ({
	list: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "GET", path: "/users" })
		.input(userListInputSchema)
		.output(userListSchema)
		.handler(({ input }) => effectRun(userList(input))),

	get: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "GET", path: "/users/{id}" })
		.input(userIdInputSchema)
		.output(userSchema)
		.handler(({ input }) => effectRun(userGet(input))),

	create: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "POST", path: "/users" })
		.input(userCreateInputSchema)
		.output(userSchema)
		.handler(({ input, context }) =>
			effectRun(userCreate(input, context.session!.user.id)),
		),

	update: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "PATCH", path: "/users/{id}" })
		.input(userUpdateInputSchema)
		.output(userSchema)
		.handler(({ input, context }) =>
			effectRun(userUpdate(input, context.session!.user.id)),
		),

	remove: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: "DELETE", path: "/users/{id}" })
		.input(userIdInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			effectRun(userDelete(input, context.session!.user.id)),
		),
});
