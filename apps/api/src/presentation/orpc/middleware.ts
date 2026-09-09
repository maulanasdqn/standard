import { canAll, type TPermission, type TRole } from "@app/permissions";
import { ORPCError, os } from "@orpc/server";
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
	async ({ context, next }) => {
		if (!context.session) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "Please sign in to continue.",
			});
		}
		return next({ context: { ...context, session: context.session } });
	},
);

export const requireRole = (...roles: TRole[]) =>
	protectedProcedure.use(async ({ context, next }) => {
		if (!context.session || !roles.includes(context.session.user.role)) {
			throw new ORPCError("FORBIDDEN", {
				message: "You don't have permission to do that.",
			});
		}
		return next();
	});

export const requirePermission = (...required: TPermission[]) =>
	protectedProcedure.use(async ({ context, next }) => {
		if (!canAll(context.permissions, required)) {
			throw new ORPCError("FORBIDDEN", {
				message: "You don't have permission to do that.",
			});
		}
		return next();
	});

export const adminProcedure = requireRole("admin");
