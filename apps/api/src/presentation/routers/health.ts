import { HEALTH_STATUS, healthSchema } from "@app/schemas";
import { APP_VERSION } from "@app/version";
import { publicProcedure } from "#/presentation/orpc/middleware.ts";
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PATH } from "#/presentation/route-paths.ts";

export const healthRouterBuild = () => ({
	check: publicProcedure
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.HEALTH })
		.output(healthSchema)
		.handler(() => ({ status: HEALTH_STATUS.OK, version: APP_VERSION })),
});
