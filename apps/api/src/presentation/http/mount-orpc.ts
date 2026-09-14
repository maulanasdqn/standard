import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { Hono } from "hono";
import { match, P } from "ts-pattern";
import type { TORPCContext } from "#/presentation/orpc/context.ts";
import { APP_VERSION } from "@app/version";
import { ROUTE_PREFIX } from "#/presentation/route-paths.ts";
import type { TAppRouter } from "#/presentation/routers/index.ts";

const API_TITLE = "Standard API";

type TLogger = { error: (data: Record<string, unknown>, msg: string) => void };

type TDeps = {
	app: Hono;
	router: TAppRouter;
	logger: TLogger;
	buildContext: (headers: Headers) => Promise<TORPCContext>;
};

export const orpcMount = ({
	app,
	router,
	logger,
	buildContext,
}: TDeps): void => {
	const rpcHandler = new RPCHandler(router, {
		interceptors: [
			onError((error) => logger.error({ err: error }, "orpc rpc error")),
		],
	});

	app.all(`${ROUTE_PREFIX.RPC}/*`, async (context) => {
		const { matched, response } = await rpcHandler.handle(context.req.raw, {
			prefix: ROUTE_PREFIX.RPC,
			context: await buildContext(context.req.raw.headers),
		});
		return match({ matched, response })
			.with(
				{ matched: true, response: P.nonNullable },
				({ response: found }) => found,
			)
			.otherwise(() => context.notFound());
	});

	const openApiHandler = new OpenAPIHandler(router, {
		interceptors: [
			onError((error) => logger.error({ err: error }, "orpc openapi error")),
		],
		plugins: [
			new SmartCoercionPlugin({
				schemaConverters: [new ZodToJsonSchemaConverter()],
			}),
			new OpenAPIReferencePlugin({
				schemaConverters: [new ZodToJsonSchemaConverter()],
				specGenerateOptions: {
					info: { title: API_TITLE, version: APP_VERSION },
				},
			}),
		],
	});

	app.all(`${ROUTE_PREFIX.OPENAPI}/*`, async (context) => {
		const { matched, response } = await openApiHandler.handle(context.req.raw, {
			prefix: ROUTE_PREFIX.OPENAPI,
			context: await buildContext(context.req.raw.headers),
		});
		return match({ matched, response })
			.with(
				{ matched: true, response: P.nonNullable },
				({ response: found }) => found,
			)
			.otherwise(() => context.notFound());
	});
};
