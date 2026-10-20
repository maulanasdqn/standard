import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webPathOf } from "@app/contract";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import {
	landingDistMount,
	type TLandingMountPaths,
} from "#/platform/http/mount-landing-dist.ts";
import { webDistMount } from "#/platform/http/mount-web-dist.ts";

const URL_BASE = "http://localhost";
const NOT_FOUND = 404;
const LANDING_PAGE = "<html>landing</html>";
const WEB_SHELL = "<html>web</html>";
const LANDING_ASSET = "/_astro/page-1a2b3c.css";
const CACHE_CONTROL_HEADER = "cache-control";
const LOCATION_HEADER = "location";

const distFake = (prefix: string, page: string): string => {
	const root = mkdtempSync(join(tmpdir(), prefix));
	writeFileSync(join(root, "index.html"), page);
	return root;
};

const landingFake = (): string => {
	const root = distFake("landing-dist-", LANDING_PAGE);
	mkdirSync(join(root, "_astro"));
	writeFileSync(join(root, LANDING_ASSET), "body{}");
	return root;
};

const appWith = (paths: TLandingMountPaths): Hono => {
	const app = new Hono();
	webDistMount(app, paths.webDistPath);
	landingDistMount(app, paths);
	return app;
};

const request = async (app: Hono, path: string): Promise<Response> =>
	await app.request(`${URL_BASE}${path}`);

describe("landingDistMount", () => {
	it("serves the landing at the root when a landing build is configured", async (): Promise<void> => {
		const app = appWith({
			landingDistPath: landingFake(),
			webDistPath: distFake("web-dist-", WEB_SHELL),
		});

		const response = await request(app, "/");

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(await response.text()).toBe(LANDING_PAGE);
		expect(response.headers.get(CACHE_CONTROL_HEADER)).toBe("no-cache");
	});

	it("lets a hashed landing asset be cached for a year", async (): Promise<void> => {
		const app = appWith({
			landingDistPath: landingFake(),
			webDistPath: undefined,
		});

		const response = await request(app, LANDING_ASSET);

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.headers.get(CACHE_CONTROL_HEADER)).toBe(
			"public, max-age=31536000, immutable",
		);
	});

	it("keeps the web routes on the web when both builds are served", async (): Promise<void> => {
		const app = appWith({
			landingDistPath: landingFake(),
			webDistPath: distFake("web-dist-", WEB_SHELL),
		});

		const response = await request(app, webPathOf("/notes/abc"));

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(await response.text()).toBe(WEB_SHELL);
	});

	it("sends the root to the web when there is no landing", async (): Promise<void> => {
		const app = appWith({
			landingDistPath: undefined,
			webDistPath: distFake("web-dist-", WEB_SHELL),
		});

		const response = await request(app, "/");

		expect(response.status).toBe(HTTP_STATUS.FOUND);
		expect(response.headers.get(LOCATION_HEADER)).toBe(webPathOf("/"));
	});

	it("serves nothing at the root when neither build is configured", async (): Promise<void> => {
		const app = appWith({ landingDistPath: undefined, webDistPath: undefined });

		const response = await request(app, "/");

		expect(response.status).toBe(NOT_FOUND);
	});
});
