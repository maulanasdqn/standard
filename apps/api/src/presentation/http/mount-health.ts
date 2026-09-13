import { APP_VERSION } from "@app/version";
import type { Hono } from "hono";

export const healthMount = (app: Hono): void => {
	app.get("/healthz", (context) =>
		context.json({ status: "ok", version: APP_VERSION }),
	);
	app.get("/ready", (context) =>
		context.json({ status: "ready", version: APP_VERSION }),
	);
};
