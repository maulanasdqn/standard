import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WEB_BASE_PATH, webPathOf } from "@app/contract";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import { webDistMount } from "#/platform/http/mount-web-dist.ts";

const URL_BASE = "http://localhost";
const NOT_FOUND = 404;
const ASSET_FILE = "/assets/app-1a2b3c.js";
const SHELL = "<html></html>";
const CACHE_CONTROL_HEADER = "cache-control";
const LOOKALIKE_PATH = `${WEB_BASE_PATH}lication`;

const distFake = (): string => {
	const root = mkdtempSync(join(tmpdir(), "web-dist-"));
	mkdirSync(join(root, "assets"));
	writeFileSync(join(root, "index.html"), SHELL);
	writeFileSync(join(root, ASSET_FILE), "console.log(1)");
	return root;
};

const appWith = (path: string | undefined): Hono => {
	const app = new Hono();
	webDistMount(app, path);
	return app;
};

const request = async (app: Hono, path: string): Promise<Response> =>
	await app.request(`${URL_BASE}${path}`);

describe("webDistMount", () => {
	it("serves nothing when no dist path is configured", async (): Promise<void> => {
		const response = await request(appWith(undefined), webPathOf("/"));

		expect(response.status).toBe(NOT_FOUND);
	});

	it("lets a hashed asset be cached for a year without revalidation", async (): Promise<void> => {
		const response = await request(appWith(distFake()), webPathOf(ASSET_FILE));

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.headers.get(CACHE_CONTROL_HEADER)).toBe(
			"public, max-age=31536000, immutable",
		);
	});

	it("makes the browser revalidate the shell on every load", async (): Promise<void> => {
		const response = await request(appWith(distFake()), webPathOf("/"));

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(await response.text()).toBe(SHELL);
		expect(response.headers.get(CACHE_CONTROL_HEADER)).toBe("no-cache");
	});

	it("makes the browser revalidate the shell served for a client route too", async (): Promise<void> => {
		const response = await request(
			appWith(distFake()),
			webPathOf("/notes/abc"),
		);

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(await response.text()).toBe(SHELL);
		expect(response.headers.get(CACHE_CONTROL_HEADER)).toBe("no-cache");
	});

	it("serves the shell at the base path without a trailing slash", async (): Promise<void> => {
		const response = await request(appWith(distFake()), WEB_BASE_PATH);

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(await response.text()).toBe(SHELL);
	});

	it("leaves every path outside the base path to the rest of the app", async (): Promise<void> => {
		const app = appWith(distFake());

		expect((await request(app, "/notes/abc")).status).toBe(NOT_FOUND);
		expect((await request(app, ASSET_FILE)).status).toBe(NOT_FOUND);
		expect((await request(app, LOOKALIKE_PATH)).status).toBe(NOT_FOUND);
	});
});
