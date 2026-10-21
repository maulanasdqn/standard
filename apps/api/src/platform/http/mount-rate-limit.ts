import type { TCacheClient } from "@app/cache";
import type { Hono, MiddlewareHandler } from "hono";
import { env } from "#/platform/config/env.ts";
import { rateLimit } from "#/platform/http/rate-limit.ts";
import {
	RATE_LIMIT_SCOPE,
	type TRateLimitScope,
} from "#/platform/http/rate-limit-scopes.ts";
import {
	NEWSLETTER_SUBSCRIBE_ROUTE,
	ROUTE_PREFIX,
} from "#/platform/http/route-paths.ts";

const limiterFor = (
	client: TCacheClient,
	scope: TRateLimitScope,
): MiddlewareHandler =>
	rateLimit({
		client,
		scope,
		windowSeconds: env.RATE_LIMIT_WINDOW_SECONDS,
		max: env.RATE_LIMIT_MAX,
		trustedProxyIps: env.RATE_LIMIT_TRUSTED_PROXY_IPS,
	});

export const rateLimitMount = (app: Hono, client: TCacheClient): void => {
	const newsletterLimiter = limiterFor(client, RATE_LIMIT_SCOPE.NEWSLETTER);

	app.use(`${ROUTE_PREFIX.AUTH}/*`, limiterFor(client, RATE_LIMIT_SCOPE.AUTH));
	app.use(NEWSLETTER_SUBSCRIBE_ROUTE.OPENAPI, newsletterLimiter);
	app.use(NEWSLETTER_SUBSCRIBE_ROUTE.RPC, newsletterLimiter);
};
