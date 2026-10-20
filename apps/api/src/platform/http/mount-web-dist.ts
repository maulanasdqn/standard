import { WEB_BASE_PATH } from "@app/contract";
import type { Hono } from "hono";
import { match, P } from "ts-pattern";
import { cachedStatic } from "#/platform/http/static-files.ts";

const WEB_ROUTES = `${WEB_BASE_PATH}/*`;
const HASHED_ASSET_PREFIX = `${WEB_BASE_PATH}/assets/`;
const SHELL_FILE = "index.html";

const withoutBasePath = (requestPath: string): string =>
	requestPath.slice(WEB_BASE_PATH.length);

export const webDistMount = (
	app: Hono,
	webDistPath: string | undefined,
): void => {
	match(webDistPath)
		.with(P.nullish, (): undefined => undefined)
		.otherwise((path): void => {
			app.use(
				WEB_ROUTES,
				cachedStatic(
					{ root: path, rewriteRequestPath: withoutBasePath },
					HASHED_ASSET_PREFIX,
				),
			);
			app.get(
				WEB_ROUTES,
				cachedStatic({ path: `${path}/${SHELL_FILE}` }, HASHED_ASSET_PREFIX),
			);
		});
};
