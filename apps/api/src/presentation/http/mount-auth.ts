import type { Hono } from "hono";
import type { TAuth } from "#/infrastructure/auth/better-auth.ts";

export const mountAuth = (app: Hono, auth: TAuth): void => {
	app.on(["GET", "POST"], "/api/auth/*", (context) =>
		auth.handler(context.req.raw),
	);
};
