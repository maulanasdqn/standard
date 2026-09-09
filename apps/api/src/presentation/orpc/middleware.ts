import { canAll, type TPermission, type TRole } from "@app/permissions";
import { A, D } from "@mobily/ts-belt";
import { ORPCError, os } from "@orpc/server";
import { match, P } from "ts-pattern";
import type { ORPCContext } from "#/presentation/orpc/context.ts";
import { toORPCError } from "#/presentation/orpc/error-mapping.ts";

const base = os.$context<ORPCContext>();

export const publicProcedure = base.use(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		throw toORPCError(error);
	}
});

export const protectedProcedure = publicProcedure.use(
	async ({ context, next }) =>
		match(context.session)
			.with(P.nullish, () => {
				throw new ORPCError("UNAUTHORIZED", {
					message: "Please sign in to continue.",
				});
			})
			.otherwise((session) => next({ context: D.merge(context, { session }) })),
);

export const requireRole = (...roles: TRole[]) =>
	protectedProcedure.use(async ({ context, next }) => {
		const allowed =
			context.session != null && A.includes(roles, context.session.user.role);

		return match(allowed)
			.with(false, () => {
				throw new ORPCError("FORBIDDEN", {
					message: "You don't have permission to do that.",
				});
			})
			.otherwise(() => next());
	});

export const requirePermission = (...required: TPermission[]) =>
	protectedProcedure.use(async ({ context, next }) =>
		match(canAll(context.permissions, required))
			.with(false, () => {
				throw new ORPCError("FORBIDDEN", {
					message: "You don't have permission to do that.",
				});
			})
			.otherwise(() => next()),
	);

export const adminProcedure = requireRole("admin");
