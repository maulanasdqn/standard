import { PERMISSION } from "@app/permissions";
import { activityListInputSchema, activityListSchema } from "@app/schemas";
import { activityList } from "#/application/activity/activity-list.ts";
import { permissionRequire } from "#/presentation/orpc/middleware.ts";
import { effectRun } from "#/presentation/orpc/run-effect.ts";
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PATH } from "#/presentation/route-paths.ts";

export const activityRouterBuild = () => ({
	list: permissionRequire(PERMISSION.ACTIVITY_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.ACTIVITY })
		.input(activityListInputSchema)
		.output(activityListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, activityList(input)),
		),
});
