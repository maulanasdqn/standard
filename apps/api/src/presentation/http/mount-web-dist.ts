import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";

/**
 * Serves the built SPA from `webDistPath` with a client-side-routing fallback to
 * `index.html`. No-op when `webDistPath` isn't set (local dev serves the SPA via Vite instead).
 */
export const mountWebDist = (
	app: Hono,
	webDistPath: string | undefined,
): void => {
	if (!webDistPath) {
		return;
	}

	app.use("/*", serveStatic({ root: webDistPath }));
	app.get("*", serveStatic({ path: `${webDistPath}/index.html` }));
};
