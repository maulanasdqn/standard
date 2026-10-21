import { cacheClientFake } from "@app/cache/testing";
import { Hono } from "hono";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import {
	NEWSLETTER_SUBSCRIBE_ROUTE,
	ROUTE_PREFIX,
	UPLOAD_ROUTE,
} from "#/platform/http/route-paths.ts";

const ENV_PATH = "#/platform/config/env.ts";
const MAX = 1;
const WINDOW_SECONDS = 60;
const CLIENT_IP = "203.0.113.7";
const SIGN_IN_PATH = `${ROUTE_PREFIX.AUTH}/sign-in/email`;
const POST = { method: "POST" };

const envOf = (): { env: Record<string, unknown> } => ({
	env: {
		RATE_LIMIT_MAX: MAX,
		RATE_LIMIT_WINDOW_SECONDS: WINDOW_SECONDS,
		RATE_LIMIT_TRUSTED_PROXY_IPS: [],
	},
});

const clientEnv = {
	incoming: {
		socket: {
			remoteAddress: CLIENT_IP,
			remotePort: 4321,
			remoteFamily: "IPv4",
		},
	},
};

const appBuild = async (): Promise<Hono> => {
	vi.doMock(ENV_PATH, envOf);
	const { rateLimitMount } = await import(
		"#/platform/http/mount-rate-limit.ts"
	);
	const app = new Hono();
	rateLimitMount(app, cacheClientFake());
	app.post("*", (context) => context.body(null, HTTP_STATUS.OK));
	return app;
};

const statusOf = async (app: Hono, path: string): Promise<number> =>
	(await app.request(path, POST, clientEnv)).status;

describe("rateLimitMount", () => {
	afterEach((): void => {
		vi.doUnmock(ENV_PATH);
		vi.resetModules();
	});

	it("limits the newsletter sign-up over REST and RPC as one budget", async (): Promise<void> => {
		const app = await appBuild();

		expect(await statusOf(app, NEWSLETTER_SUBSCRIBE_ROUTE.OPENAPI)).toBe(
			HTTP_STATUS.OK,
		);
		expect(await statusOf(app, NEWSLETTER_SUBSCRIBE_ROUTE.RPC)).toBe(
			HTTP_STATUS.TOO_MANY_REQUESTS,
		);
	});

	it("keeps the sign-in budget apart from the newsletter one", async (): Promise<void> => {
		const app = await appBuild();

		await statusOf(app, NEWSLETTER_SUBSCRIBE_ROUTE.OPENAPI);

		expect(await statusOf(app, SIGN_IN_PATH)).toBe(HTTP_STATUS.OK);
		expect(await statusOf(app, SIGN_IN_PATH)).toBe(
			HTTP_STATUS.TOO_MANY_REQUESTS,
		);
	});

	it("leaves the rest of the API unlimited", async (): Promise<void> => {
		const app = await appBuild();

		expect(await statusOf(app, UPLOAD_ROUTE.NOTE_ATTACHMENT_RPC)).toBe(
			HTTP_STATUS.OK,
		);
		expect(await statusOf(app, UPLOAD_ROUTE.NOTE_ATTACHMENT_RPC)).toBe(
			HTTP_STATUS.OK,
		);
	});
});
