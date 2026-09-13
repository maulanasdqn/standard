import { HEALTH_STATUS } from "@app/schemas";
import { APP_VERSION } from "@app/version";
import type { Hono } from "hono";

export const healthMount = (app: Hono): void => {
	app.get("/healthz", (context) =>
		context.json({ status: HEALTH_STATUS.OK, version: APP_VERSION }),
	);
	app.get("/ready", (context) =>
		context.json({ status: HEALTH_STATUS.READY, version: APP_VERSION }),
	);
};
