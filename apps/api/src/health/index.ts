import { healthRouterBuild } from "#/health/presentation/health-router.ts";
import { healthMount } from "#/health/presentation/mount-health.ts";

export { healthMount };

export const healthModule = {
	routerBuild: healthRouterBuild,
};
