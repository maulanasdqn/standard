import { HEALTH_STATUS } from "@app/schemas";
import { ROUTE_PATH } from "#/platform/http/route-paths.ts";
import { APP_VERSION } from "@app/version";
import type { Hono } from "hono";

export const healthMount = (app: Hono): void => {
	app.get(ROUTE_PATH.HEALTHZ, (context) =>
		context.json({ status: HEALTH_STATUS.OK, version: APP_VERSION }),
	);
	app.get(ROUTE_PATH.READY, (context) =>
		context.json({ status: HEALTH_STATUS.READY, version: APP_VERSION }),
	);
};
