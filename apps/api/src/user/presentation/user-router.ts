import { PERMISSION } from "@app/permissions";
import { userCreate } from "#/user/application/user-create.ts";
import { userDelete } from "#/user/application/user-delete.ts";
import { userGet } from "#/user/application/user-get.ts";
import { userList } from "#/user/application/user-list.ts";
import { userPasswordReset } from "#/user/application/user-password-reset.ts";
import { userUpdate } from "#/user/application/user-update.ts";
import { implementer, permissionGuarded } from "#/platform/orpc/implementer.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const manage = permissionGuarded(PERMISSION.USER_MANAGE);

const userRouter = implementer.user.router({
	list: manage.user.list.handler(({ input, context }) =>
		effectRun(context.runtime, userList(input)),
	),

	get: manage.user.get.handler(({ input, context }) =>
		effectRun(context.runtime, userGet(input)),
	),

	create: manage.user.create.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			userCreate(input, context.session.user.id),
		),
	),

	update: manage.user.update.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			userUpdate(input, context.session.user.id),
		),
	),

	remove: manage.user.remove.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			userDelete(input, context.session.user.id),
		),
	),

	resetPassword: manage.user.resetPassword.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			userPasswordReset(input, context.session.user.id),
		),
	),
});

export type TUserRouter = typeof userRouter;

export const userRouterBuild = (): TUserRouter => userRouter;
