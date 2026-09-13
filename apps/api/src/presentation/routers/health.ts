import { HEALTH_STATUS, healthSchema } from "@app/schemas";
import { APP_VERSION } from "@app/version";
import { publicProcedure } from "#/presentation/orpc/middleware.ts";

export const healthRouterBuild = () => ({
	check: publicProcedure
		.route({ method: "GET", path: "/health" })
		.output(healthSchema)
		.handler(() => ({ status: HEALTH_STATUS.OK, version: APP_VERSION })),
});
