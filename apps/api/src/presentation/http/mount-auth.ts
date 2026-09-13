import type { Hono } from "hono";
import type { TAuth } from "#/infrastructure/auth/better-auth.ts";
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PREFIX } from "#/presentation/route-paths.ts";

export const authMount = (app: Hono, auth: TAuth): void => {
	app.on(
		[HTTP_METHOD.GET, HTTP_METHOD.POST],
		`${ROUTE_PREFIX.AUTH}/*`,
		(context) => auth.handler(context.req.raw),
	);
};
