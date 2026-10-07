import { PERMISSION } from "@app/permissions";
import { roleCreate } from "#/role/application/role-create.ts";
import { roleDelete } from "#/role/application/role-delete.ts";
import { roleGet } from "#/role/application/role-get.ts";
import { roleList } from "#/role/application/role-list.ts";
import { roleUpdate } from "#/role/application/role-update.ts";
import { implementer, permissionGuarded } from "#/platform/orpc/implementer.ts";
import { actorAuthorityOf } from "#/shared/session.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const roleRouter = implementer.role.router({
	list: permissionGuarded(PERMISSION.ROLE_READ).role.list.handler(
		({ context }) => effectRun(context.runtime, roleList()),
	),

	get: permissionGuarded(PERMISSION.ROLE_READ).role.get.handler(
		({ input, context }) => effectRun(context.runtime, roleGet(input)),
	),

	create: permissionGuarded(PERMISSION.ROLE_CREATE).role.create.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				roleCreate(
					input,
					context.session.user.id,
					actorAuthorityOf(context.session),
				),
			),
	),

	update: permissionGuarded(PERMISSION.ROLE_UPDATE).role.update.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				roleUpdate(
					input,
					context.session.user.id,
					actorAuthorityOf(context.session),
				),
			),
	),

	remove: permissionGuarded(PERMISSION.ROLE_DELETE).role.remove.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				roleDelete(input, context.session.user.id),
			),
	),
});

export type TRoleRouter = typeof roleRouter;

export const roleRouterBuild = (): TRoleRouter => roleRouter;
