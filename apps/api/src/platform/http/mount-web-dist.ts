import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";
import { match, P } from "ts-pattern";

export const webDistMount = (
	app: Hono,
	webDistPath: string | undefined,
): void => {
	match(webDistPath)
		.with(P.nullish, () => undefined)
		.otherwise((path) => {
			app.use("/*", serveStatic({ root: path }));
			app.get("*", serveStatic({ path: `${path}/index.html` }));
		});
};
