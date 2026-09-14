import { HEALTH_STATUS, healthSchema } from "@app/schemas";
import { APP_VERSION } from "@app/version";
import { publicProcedure } from "#/platform/orpc/middleware.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { ROUTE_PATH } from "#/platform/http/route-paths.ts";

export const healthRouterBuild = () => ({
	check: publicProcedure
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.HEALTH })
		.output(healthSchema)
		.handler(() => ({ status: HEALTH_STATUS.OK, version: APP_VERSION })),
});
