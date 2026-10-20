import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webPathOf } from "@app/contract";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import {
	LANDING_POLICY,
	landingDistMount,
	type TLandingMountPaths,
} from "#/platform/http/mount-landing-dist.ts";
import { webDistMount } from "#/platform/http/mount-web-dist.ts";

const URL_BASE = "http://localhost";
const LANDING_PAGE = "<html>landing</html>";
const LANDING_NOT_FOUND = "<html>not found</html>";
const WEB_SHELL = "<html>web</html>";
const LANDING_ASSET = "/_astro/page-1a2b3c.css";
const CACHE_CONTROL_HEADER = "cache-control";
const LOCATION_HEADER = "location";
const POLICY_HEADER = "content-security-policy";
const API_ROUTE = "/healthz";

const distFake = (prefix: string, page: string): string => {
	const root = mkdtempSync(join(tmpdir(), prefix));
	writeFileSync(join(root, "index.html"), page);
	return root;
};

const landingFake = (): string => {
	const root = distFake("landing-dist-", LANDING_PAGE);
	mkdirSync(join(root, "_astro"));
	writeFileSync(join(root, LANDING_ASSET), "body{}");
	writeFileSync(join(root, "404.html"), LANDING_NOT_FOUND);
	return root;
};

const appWith = (paths: TLandingMountPaths): Hono => {
	const app = new Hono();
	app.get(API_ROUTE, (context): Response => context.text("ok"));
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

	it("answers a path the landing does not have with its not found page", async (): Promise<void> => {
		const app = appWith({
			landingDistPath: landingFake(),
			webDistPath: undefined,
		});

		const response = await request(app, "/nowhere");

		expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
		expect(await response.text()).toBe(LANDING_NOT_FOUND);
	});

	it("sends its content security policy with every landing response", async (): Promise<void> => {
		const app = appWith({
			landingDistPath: landingFake(),
			webDistPath: undefined,
		});

		const page = await request(app, "/");
		const missing = await request(app, "/nowhere");

		expect(page.headers.get(POLICY_HEADER)).toBe(LANDING_POLICY);
		expect(missing.headers.get(POLICY_HEADER)).toBe(LANDING_POLICY);
	});

	it("leaves the policy off the responses of the web and the api", async (): Promise<void> => {
		const app = appWith({
			landingDistPath: landingFake(),
			webDistPath: distFake("web-dist-", WEB_SHELL),
		});

		const web = await request(app, webPathOf("/notes/abc"));
		const api = await request(app, API_ROUTE);

		expect(web.headers.get(POLICY_HEADER)).toBeNull();
		expect(api.headers.get(POLICY_HEADER)).toBeNull();
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

		expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
	});
});
