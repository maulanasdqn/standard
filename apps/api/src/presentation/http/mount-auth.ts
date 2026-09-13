import type { Hono } from "hono";
import type { TAuthHandler } from "#/domain/ports/auth-handler.ts";
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PREFIX } from "#/presentation/route-paths.ts";

export const authMount = (app: Hono, auth: TAuthHandler): void => {
	app.on(
		[HTTP_METHOD.GET, HTTP_METHOD.POST],
		`${ROUTE_PREFIX.AUTH}/*`,
		(context) => auth.handler(context.req.raw),
	);
};
