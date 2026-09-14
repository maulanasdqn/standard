import { PERMISSION } from "@app/permissions";
import {
	userCreateInputSchema,
	userIdInputSchema,
	userListInputSchema,
	userListSchema,
	userPasswordResetInputSchema,
	userSchema,
	userUpdateInputSchema,
} from "@app/schemas";
import { z } from "zod";
import { userCreate } from "#/application/user/user-create.ts";
import { userDelete } from "#/application/user/user-delete.ts";
import { userGet } from "#/application/user/user-get.ts";
import { userList } from "#/application/user/user-list.ts";
import { userPasswordReset } from "#/application/user/user-password-reset.ts";
import { userUpdate } from "#/application/user/user-update.ts";
import { permissionRequire } from "#/presentation/orpc/middleware.ts";
import { effectRun } from "#/presentation/orpc/run-effect.ts";
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PATH } from "#/presentation/route-paths.ts";

export const userRouterBuild = () => ({
	list: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.USERS })
		.input(userListInputSchema)
		.output(userListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, userList(input)),
		),

	get: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.USER })
		.input(userIdInputSchema)
		.output(userSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, userGet(input)),
		),

	create: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.USERS })
		.input(userCreateInputSchema)
		.output(userSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, userCreate(input, context.session!.user.id)),
		),

	update: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.PATCH, path: ROUTE_PATH.USER })
		.input(userUpdateInputSchema)
		.output(userSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, userUpdate(input, context.session!.user.id)),
		),

	remove: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.USER })
		.input(userIdInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			effectRun(context.runtime, userDelete(input, context.session!.user.id)),
		),

	resetPassword: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.USER_PASSWORD })
		.input(userPasswordResetInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				userPasswordReset(input, context.session!.user.id),
			),
		),
});
