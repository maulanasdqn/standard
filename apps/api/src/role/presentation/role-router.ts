import { PERMISSION } from "@app/permissions";
import { roleCreate } from "#/role/application/role-create.ts";
import { roleDelete } from "#/role/application/role-delete.ts";
import { roleGet } from "#/role/application/role-get.ts";
import { roleList } from "#/role/application/role-list.ts";
import { roleUpdate } from "#/role/application/role-update.ts";
import { implementer, permissionGuarded } from "#/platform/orpc/implementer.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const manage = permissionGuarded(PERMISSION.USER_MANAGE);

const roleRouter = implementer.role.router({
	list: manage.role.list.handler(({ context }) =>
		effectRun(context.runtime, roleList()),
	),

	get: manage.role.get.handler(({ input, context }) =>
		effectRun(context.runtime, roleGet(input)),
	),

	create: manage.role.create.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			roleCreate(input, context.session.user.id),
		),
	),

	update: manage.role.update.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			roleUpdate(input, context.session.user.id),
		),
	),

	remove: manage.role.remove.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			roleDelete(input, context.session.user.id),
		),
	),
});

export type TRoleRouter = typeof roleRouter;

export const roleRouterBuild = (): TRoleRouter => roleRouter;
