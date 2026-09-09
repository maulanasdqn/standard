import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { Hono } from "hono";
import { match, P } from "ts-pattern";
import type { ORPCContext } from "#/presentation/orpc/context.ts";
import type { TAppRouter } from "#/presentation/routers/index.ts";

const RPC_PREFIX = "/rpc";
const OPENAPI_PREFIX = "/api";

type TLogger = { error: (data: Record<string, unknown>, msg: string) => void };

type TDeps = {
	app: Hono;
	router: TAppRouter;
	logger: TLogger;
	buildContext: (headers: Headers) => Promise<ORPCContext>;
};

export const mountOrpc = ({
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

	app.all(`${RPC_PREFIX}/*`, async (context) => {
		const { matched, response } = await rpcHandler.handle(context.req.raw, {
			prefix: RPC_PREFIX,
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
					info: { title: "Standard API", version: "0.1.0" },
				},
			}),
		],
	});

	app.all(`${OPENAPI_PREFIX}/*`, async (context) => {
		const { matched, response } = await openApiHandler.handle(context.req.raw, {
			prefix: OPENAPI_PREFIX,
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
