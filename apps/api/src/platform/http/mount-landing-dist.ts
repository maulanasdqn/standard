import { WEB_BASE_PATH } from "@app/contract";
import type { Hono } from "hono";
import { match, P } from "ts-pattern";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import { cachedStatic } from "#/platform/http/static-files.ts";

const ROOT_PATH = "/";
const LANDING_ROUTES = "/*";
const HASHED_ASSET_PREFIX = "/_astro/";
const WEB_ENTRY = `${WEB_BASE_PATH}/`;

export type TLandingMountPaths = {
	landingDistPath: string | undefined;
	webDistPath: string | undefined;
};

export const landingDistMount = (
	app: Hono,
	paths: TLandingMountPaths,
): void => {
	match(paths)
		.with({ landingDistPath: P.string.select() }, (root): void => {
			app.use(LANDING_ROUTES, cachedStatic({ root }, HASHED_ASSET_PREFIX));
		})
		.with({ webDistPath: P.string }, (): void => {
			app.get(
				ROOT_PATH,
				(context): Response => context.redirect(WEB_ENTRY, HTTP_STATUS.FOUND),
			);
		})
		.otherwise((): undefined => undefined);
};
