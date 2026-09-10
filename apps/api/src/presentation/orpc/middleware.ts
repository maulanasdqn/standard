import { AUTH_MESSAGE } from "@app/messages";
import { canAll, type TPermission } from "@app/permissions";
import { D } from "@mobily/ts-belt";
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
					message: AUTH_MESSAGE.UNAUTHORIZED,
				});
			})
			.otherwise((session) => next({ context: D.merge(context, { session }) })),
);

export const permissionRequire = (...required: TPermission[]) =>
	protectedProcedure.use(async ({ context, next }) =>
		match(canAll(context.permissions, required))
			.with(false, () => {
				throw new ORPCError("FORBIDDEN", { message: AUTH_MESSAGE.FORBIDDEN });
			})
			.otherwise(() => next()),
	);
