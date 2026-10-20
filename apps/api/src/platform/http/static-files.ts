import {
	type ServeStaticOptions,
	serveStatic,
} from "@hono/node-server/serve-static";
import type { MiddlewareHandler } from "hono";
import { match, P } from "ts-pattern";

const CACHE_CONTROL_HEADER = "Cache-Control";
const ONE_YEAR_SECONDS = 31_536_000;

const CACHE_CONTROL = {
	IMMUTABLE: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
	REVALIDATE: "no-cache",
} as const;

const cacheControlFor = (
	requestPath: string,
	hashedAssetPrefix: string,
): string =>
	match(requestPath)
		.with(
			P.string.startsWith(hashedAssetPrefix),
			(): string => CACHE_CONTROL.IMMUTABLE,
		)
		.otherwise((): string => CACHE_CONTROL.REVALIDATE);

export const cachedStatic = (
	options: ServeStaticOptions,
	hashedAssetPrefix: string,
): MiddlewareHandler => {
	const serve = serveStatic(options);

	return async (context, next): Promise<Response | undefined> => {
		const served = await serve(context, next);

		return match(served)
			.with(P.instanceOf(Response), (response): Response => {
				response.headers.set(
					CACHE_CONTROL_HEADER,
					cacheControlFor(context.req.path, hashedAssetPrefix),
				);
				return response;
			})
			.otherwise((): undefined => undefined);
	};
};
