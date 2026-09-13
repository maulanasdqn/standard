import { meSchema } from "@app/schemas";
import { protectedProcedure } from "#/presentation/orpc/middleware.ts";
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PATH } from "#/presentation/route-paths.ts";

export const meRouterBuild = () => ({
	get: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.ME })
		.output(meSchema)
		.handler(({ context }) => ({
			user: context.session!.user,
			permissions: [...context.permissions],
		})),
});
