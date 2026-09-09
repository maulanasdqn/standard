import type { Hono } from "hono";

export const healthMount = (app: Hono): void => {
	app.get("/healthz", (context) => context.json({ status: "ok" }));
	app.get("/ready", (context) => context.json({ status: "ready" }));
};
