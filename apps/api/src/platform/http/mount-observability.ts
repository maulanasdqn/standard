import type { TLogger } from "@app/logger";
import { type TMetrics, metricsRouteNormalise } from "@app/metrics";
import { A } from "@mobily/ts-belt";
import type { Hono } from "hono";
import { match } from "ts-pattern";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import { ROUTE_PATH } from "#/platform/http/route-paths.ts";

const PROBE_PATH: readonly string[] = [
	ROUTE_PATH.HEALTHZ,
	ROUTE_PATH.READY,
	ROUTE_PATH.METRICS,
];

export type TObservabilityMountDeps = {
	logger: TLogger;
	metrics: TMetrics;
};

export const observabilityMount = (
	app: Hono,
	deps: TObservabilityMountDeps,
): void => {
	app.use("*", async (context, next): Promise<void> => {
		const reqId = context.get("requestId");
		const start = Date.now();
		let status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;

		try {
			await next();
			status = context.res.status;
		} finally {
			const durMs = Date.now() - start;
			const method = context.req.method;
			const path = context.req.path;

			deps.logger.info({ reqId, method, path, status, durMs }, "request");

			match(A.includes(PROBE_PATH, path))
				.with(true, (): void => undefined)
				.otherwise((): void => {
					deps.metrics.requestObserve(
						method,
						metricsRouteNormalise(context.req.routePath),
						status,
						durMs,
					);
				});
		}
	});
};
