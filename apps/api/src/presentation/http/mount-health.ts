import type { Hono } from "hono";

export const mountHealth = (app: Hono): void => {
	app.get("/healthz", (context) => context.json({ status: "ok" }));
	app.get("/ready", (context) => context.json({ status: "ready" }));
};
