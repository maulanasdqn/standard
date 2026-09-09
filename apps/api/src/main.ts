import "#/bootstrap/polyfill.ts";

import { serve } from "@hono/node-server";
import { Effect } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { runtime } from "#/bootstrap/compose.ts";
import { AuthService } from "#/infrastructure/auth/auth-service.ts";
import { env } from "#/infrastructure/config/env.ts";
import { logger } from "#/infrastructure/observability/logger.ts";
import { mountAuth } from "#/presentation/http/mount-auth.ts";
import { mountHealth } from "#/presentation/http/mount-health.ts";
import { mountOrpc } from "#/presentation/http/mount-orpc.ts";
import { mountWebDist } from "#/presentation/http/mount-web-dist.ts";
import type { ORPCContext } from "#/presentation/orpc/context.ts";
import { buildRouter } from "#/presentation/routers/index.ts";

const { auth } = await runtime.runPromise(
	AuthService.use((service) => Effect.succeed(service)),
);

const router = buildRouter();

const buildContext = async (headers: Headers): Promise<ORPCContext> => {
	const session = await runtime.runPromise(
		AuthService.use((service) => service.getSession(headers)).pipe(
			Effect.catch(() => Effect.succeed(null)),
		),
	);
	return {
		headers,
		session,
		permissions: session?.permissions ?? [],
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

mountHealth(app);
mountAuth(app, auth);
mountOrpc({ app, router, logger, buildContext });
mountWebDist(app, env.WEB_DIST_PATH);

serve({ fetch: app.fetch, port: env.PORT }, (info): void => {
	logger.info({ port: info.port }, "api listening");
});
