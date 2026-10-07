import { PERMISSION } from "@app/permissions";
import { userCreate } from "#/user/application/user-create.ts";
import { userDelete } from "#/user/application/user-delete.ts";
import { userGet } from "#/user/application/user-get.ts";
import { userList } from "#/user/application/user-list.ts";
import { userPasswordReset } from "#/user/application/user-password-reset.ts";
import { userUpdate } from "#/user/application/user-update.ts";
import { userDeactivate } from "#/user/application/user-deactivate.ts";
import { userInvite } from "#/user/application/user-invite.ts";
import { userReactivate } from "#/user/application/user-reactivate.ts";
import { userSessionList } from "#/user/application/user-session-list.ts";
import { userSessionRevoke } from "#/user/application/user-session-revoke.ts";
import { userTwoFactorReset } from "#/user/application/user-two-factor-reset.ts";
import { userSessionsRevoke } from "#/user/application/user-sessions-revoke.ts";
import { implementer, permissionGuarded } from "#/platform/orpc/implementer.ts";
import { actorAuthorityOf } from "#/shared/session.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const userRouter = implementer.user.router({
	list: permissionGuarded(PERMISSION.USER_READ).user.list.handler(
		({ input, context }) => effectRun(context.runtime, userList(input)),
	),

	get: permissionGuarded(PERMISSION.USER_READ).user.get.handler(
		({ input, context }) => effectRun(context.runtime, userGet(input)),
	),

	create: permissionGuarded(PERMISSION.USER_CREATE).user.create.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				userCreate(
					input,
					context.session.user.id,
					actorAuthorityOf(context.session),
				),
			),
	),

	update: permissionGuarded(PERMISSION.USER_UPDATE).user.update.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				userUpdate(
					input,
					context.session.user.id,
					actorAuthorityOf(context.session),
				),
			),
	),

	remove: permissionGuarded(PERMISSION.USER_DELETE).user.remove.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				userDelete(
					input,
					context.session.user.id,
					actorAuthorityOf(context.session),
				),
			),
	),

	resetPassword: permissionGuarded(
		PERMISSION.USER_UPDATE,
	).user.resetPassword.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			userPasswordReset(
				input,
				context.session.user.id,
				actorAuthorityOf(context.session),
			),
		),
	),

	invite: permissionGuarded(PERMISSION.USER_CREATE).user.invite.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				userInvite(
					input,
					context.session.user.id,
					actorAuthorityOf(context.session),
				),
			),
	),

	deactivate: permissionGuarded(PERMISSION.USER_UPDATE).user.deactivate.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				userDeactivate(
					input,
					context.session.user.id,
					actorAuthorityOf(context.session),
				),
			),
	),

	reactivate: permissionGuarded(PERMISSION.USER_UPDATE).user.reactivate.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				userReactivate(
					input,
					context.session.user.id,
					actorAuthorityOf(context.session),
				),
			),
	),

	sessions: permissionGuarded(PERMISSION.USER_UPDATE).user.sessions.handler(
		({ input, context }) => effectRun(context.runtime, userSessionList(input)),
	),

	sessionRevoke: permissionGuarded(
		PERMISSION.USER_UPDATE,
	).user.sessionRevoke.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			userSessionRevoke(
				input,
				context.session.user.id,
				actorAuthorityOf(context.session),
			),
		),
	),

	twoFactorReset: permissionGuarded(
		PERMISSION.USER_UPDATE,
	).user.twoFactorReset.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			userTwoFactorReset(
				input,
				context.session.user.id,
				actorAuthorityOf(context.session),
			),
		),
	),

	sessionsRevoke: permissionGuarded(
		PERMISSION.USER_UPDATE,
	).user.sessionsRevoke.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			userSessionsRevoke(
				input,
				context.session.user.id,
				actorAuthorityOf(context.session),
			),
		),
	),
});

export type TUserRouter = typeof userRouter;

export const userRouterBuild = (): TUserRouter => userRouter;
