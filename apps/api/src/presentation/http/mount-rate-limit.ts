import type { TCacheClient } from "@app/cache";
import type { Hono } from "hono";
import { env } from "#/infrastructure/config/env.ts";
import { rateLimit } from "#/presentation/http/rate-limit.ts";
import { RATE_LIMIT_SCOPE } from "#/presentation/rate-limit-scopes.ts";
import { ROUTE_PREFIX } from "#/presentation/route-paths.ts";

export const rateLimitMount = (app: Hono, client: TCacheClient): void => {
	app.use(
		`${ROUTE_PREFIX.AUTH}/*`,
		rateLimit({
			client,
			scope: RATE_LIMIT_SCOPE.AUTH,
			windowSeconds: env.RATE_LIMIT_WINDOW_SECONDS,
			max: env.RATE_LIMIT_MAX,
		}),
	);
};
