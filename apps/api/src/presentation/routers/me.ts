import { meSchema } from "@app/schemas";
import { protectedProcedure } from "#/presentation/orpc/middleware.ts";

export const meRouterBuild = () => ({
	get: protectedProcedure
		.route({ method: "GET", path: "/me" })
		.output(meSchema)
		.handler(({ context }) => ({
			user: context.session!.user,
			permissions: [...context.permissions],
		})),
});
