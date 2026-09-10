import { PERMISSION } from "@app/permissions";
import { activityListInputSchema, activityListSchema } from "@app/schemas";
import { activityList } from "#/application/activity/activity-list.ts";
import { permissionRequire } from "#/presentation/orpc/middleware.ts";
import { effectRun } from "#/presentation/orpc/run-effect.ts";

export const activityRouterBuild = () => ({
	list: permissionRequire(PERMISSION.ACTIVITY_READ)
		.route({ method: "GET", path: "/activity" })
		.input(activityListInputSchema)
		.output(activityListSchema)
		.handler(({ input }) => effectRun(activityList(input))),
});
