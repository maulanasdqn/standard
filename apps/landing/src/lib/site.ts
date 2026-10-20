import { match, P } from "ts-pattern";

const SITE_MISSING = "astro.config.ts must set site for absolute URLs";

export const siteOf = (site: URL | undefined): URL =>
	match(site)
		.with(P.nullish, (): URL => {
			throw new Error(SITE_MISSING);
		})
		.otherwise((found): URL => found);

export const absoluteUrlOf = (path: string, site: URL): string =>
	new URL(path, site).href;
