import { WEB_BASE_PATH } from "@app/contract";
import { A } from "@mobily/ts-belt";
import type { Hono, MiddlewareHandler } from "hono";
import { match, P } from "ts-pattern";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import { cachedStatic } from "#/platform/http/static-files.ts";

const ROOT_PATH = "/";
const LANDING_ROUTES = "/*";
const HASHED_ASSET_PREFIX = "/_astro/";
const NOT_FOUND_PAGE = "404.html";
const WEB_ENTRY = `${WEB_BASE_PATH}/`;
const POLICY_HEADER = "Content-Security-Policy";
const POLICY_SEPARATOR = "; ";

export const LANDING_POLICY = A.join(
	[
		"default-src 'self'",
		"script-src 'self'",
		"style-src 'self'",
		"img-src 'self' data:",
		"font-src 'self'",
		"connect-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
	],
	POLICY_SEPARATOR,
);

export type TLandingMountPaths = {
	landingDistPath: string | undefined;
	webDistPath: string | undefined;
};

const landingPolicy: MiddlewareHandler = async (
	context,
	next,
): Promise<void> => {
	await next();
	context.res.headers.set(POLICY_HEADER, LANDING_POLICY);
};

const notFoundPageOf = (root: string): MiddlewareHandler => {
	const serve = cachedStatic(
		{ path: `${root}/${NOT_FOUND_PAGE}` },
		HASHED_ASSET_PREFIX,
	);

	return async (context, next): Promise<Response | undefined> =>
		match(await serve(context, next))
			.with(
				P.instanceOf(Response),
				(page): Response =>
					new Response(page.body, {
						status: HTTP_STATUS.NOT_FOUND,
						headers: page.headers,
					}),
			)
			.otherwise((): undefined => undefined);
};

export const landingDistMount = (
	app: Hono,
	paths: TLandingMountPaths,
): void => {
	match(paths)
		.with({ landingDistPath: P.string.select() }, (root): void => {
			app.use(LANDING_ROUTES, landingPolicy);
			app.use(LANDING_ROUTES, cachedStatic({ root }, HASHED_ASSET_PREFIX));
			app.get(LANDING_ROUTES, notFoundPageOf(root));
		})
		.with({ webDistPath: P.string }, (): void => {
			app.get(
				ROOT_PATH,
				(context): Response => context.redirect(WEB_ENTRY, HTTP_STATUS.FOUND),
			);
		})
		.otherwise((): undefined => undefined);
};
