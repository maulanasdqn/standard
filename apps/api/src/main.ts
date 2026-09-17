import "#/bootstrap/polyfill.ts";

import { serve } from "@hono/node-server";
import { Effect } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { runtime } from "#/bootstrap/compose.ts";
import { AuthService } from "#/auth/infrastructure/auth-service.ts";
import { CacheService } from "#/platform/cache/redis.ts";
import { env } from "#/platform/config/env.ts";
import { logger } from "#/platform/observability/logger.ts";
import { authMount } from "#/auth/presentation/mount-auth.ts";
import { healthModule, healthMount } from "#/health/index.ts";
import { orpcMount } from "#/platform/http/mount-orpc.ts";
import { rateLimitMount } from "#/platform/http/mount-rate-limit.ts";
import { webDistMount } from "#/platform/http/mount-web-dist.ts";
import type { TORPCContext } from "#/platform/orpc/context.ts";
import { routerBuild } from "#/bootstrap/router.ts";

const { auth } = await runtime.runPromise(
	AuthService.use((service) => Effect.succeed(service)),
);

const { client: cacheClient } = await runtime.runPromise(
	CacheService.use((service) => Effect.succeed(service)),
);

const router = routerBuild();

const buildContext = async (headers: Headers): Promise<TORPCContext> => {
	const session = await runtime.runPromise(
		AuthService.use((service) => service.getSession(headers)).pipe(
			Effect.catch(() => Effect.succeed(null)),
		),
	);
	return {
		headers,
		session,
		permissions: session?.permissions ?? [],
		runtime,
	};
};

const app = new Hono();

app.use("*", requestId());

app.use("*", async (context, next): Promise<void> => {
	const reqId = context.get("requestId");
	const start = Date.now();
	await next();
	logger.info(
		{
			reqId,
			method: context.req.method,
			path: context.req.path,
			status: context.res.status,
			durMs: Date.now() - start,
		},
		"request",
	);
});

app.use(
	"*",
	cors({
		origin: env.WEB_ORIGIN,
		credentials: true,
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

healthMount(app, {
	readiness: () => runtime.runPromise(healthModule.readiness()),
});
rateLimitMount(app, cacheClient);
authMount(app, auth);
orpcMount({ app, router, logger, buildContext });
webDistMount(app, env.WEB_DIST_PATH);

serve({ fetch: app.fetch, port: env.PORT }, (info): void => {
	logger.info({ port: info.port }, "api listening");
});
