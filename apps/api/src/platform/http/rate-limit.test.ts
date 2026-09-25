import type { TCacheClient } from "@app/cache";
import { cacheClientFake } from "@app/cache/testing";
import { ERROR_MESSAGE } from "@app/messages";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import { rateLimit } from "#/platform/http/rate-limit.ts";
import { RATE_LIMIT_SCOPE } from "#/platform/http/rate-limit-scopes.ts";

const MAX = 2;
const WINDOW_SECONDS = 60;
const OK_BODY = "ok";
const CLIENT_IP = "203.0.113.7";
const OTHER_IP = "198.51.100.11";

const envFor = (remoteAddress: string): Record<string, unknown> => ({
	incoming: {
		socket: { remoteAddress, remotePort: 4321, remoteFamily: "IPv4" },
	},
});

const appBuild = (client: TCacheClient): Hono => {
	const app = new Hono();
	app.use(
		"*",
		rateLimit({
			client,
			scope: RATE_LIMIT_SCOPE.AUTH,
			windowSeconds: WINDOW_SECONDS,
			max: MAX,
			trustedProxyIps: [],
		}),
	);
	app.get("/", (context) => context.text(OK_BODY));
	return app;
};

const statusesFor = async (
	app: Hono,
	remoteAddress: string,
	count: number,
): Promise<readonly number[]> => {
	const statuses: number[] = [];
	for (let index = 0; index < count; index += 1) {
		const response = await app.request("/", undefined, envFor(remoteAddress));
		statuses.push(response.status);
	}
	return statuses;
};

describe("rateLimit", () => {
	it("lets a caller through until the window's maximum and then answers 429", async (): Promise<void> => {
		const app = appBuild(cacheClientFake());

		expect(await statusesFor(app, CLIENT_IP, MAX + 1)).toEqual([
			HTTP_STATUS.OK,
			HTTP_STATUS.OK,
			HTTP_STATUS.TOO_MANY_REQUESTS,
		]);
	});

	it("tells the caller why with the shared message", async (): Promise<void> => {
		const app = appBuild(cacheClientFake());
		await statusesFor(app, CLIENT_IP, MAX);

		const response = await app.request("/", undefined, envFor(CLIENT_IP));

		expect(await response.json()).toEqual({
			message: ERROR_MESSAGE.TOO_MANY_REQUESTS,
		});
	});

	it("counts each caller separately", async (): Promise<void> => {
		const app = appBuild(cacheClientFake());
		await statusesFor(app, CLIENT_IP, MAX);

		expect(await statusesFor(app, OTHER_IP, 1)).toEqual([HTTP_STATUS.OK]);
	});

	it("starts the window's expiry on the first hit", async (): Promise<void> => {
		const client = cacheClientFake();
		await statusesFor(appBuild(client), CLIENT_IP, 1);

		expect([...client.expiries.values()]).toEqual([WINDOW_SECONDS]);
	});

	it("fails closed when the cache cannot be reached", async (): Promise<void> => {
		const broken: TCacheClient = {
			...cacheClientFake(),
			incr: (): Promise<number> => Promise.reject(new Error("cache down")),
		};

		expect(await statusesFor(appBuild(broken), CLIENT_IP, 1)).toEqual([
			HTTP_STATUS.TOO_MANY_REQUESTS,
		]);
	});
});
