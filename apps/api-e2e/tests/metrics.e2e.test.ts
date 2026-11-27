import { METRIC_NAME } from "@app/metrics";
import { describe, expect, it } from "vitest";
import { BASE_URL, client } from "../support/client.ts";

const HTTP_OK = 200;

describe("metrics", () => {
	it("serves prometheus text from a booted api", async (): Promise<void> => {
		const response = await fetch(`${BASE_URL}/metrics`);

		expect(response.status).toBe(HTTP_OK);
		expect(response.headers.get("content-type")).toContain("text/plain");

		const body = await response.text();

		expect(body).toContain("process_cpu_seconds_total");
		expect(body).toContain('service="api"');
	});

	it("counts an rpc call under its own procedure path", async (): Promise<void> => {
		await client.health.check();

		const body = await (await fetch(`${BASE_URL}/metrics`)).text();

		expect(body).toContain(METRIC_NAME.HTTP_REQUESTS_TOTAL);
		expect(body).toContain('route="/rpc/health/check"');
		expect(body).toContain('status="200"');
	});

	it("counts an rpc path that is no procedure under the mount wildcard", async (): Promise<void> => {
		await fetch(`${BASE_URL}/rpc/not/a-procedure`, { method: "POST" });

		const body = await (await fetch(`${BASE_URL}/metrics`)).text();

		expect(body).toContain('route="/rpc/*"');
		expect(body).not.toContain("a-procedure");
	});

	it("labels a rest call by its contract template, keeping the resource id out", async (): Promise<void> => {
		const id = "018f2c4e-1a2b-7c3d-9e4f-5a6b7c8d9e0f";

		await fetch(`${BASE_URL}/api/notes/${id}`);

		const body = await (await fetch(`${BASE_URL}/metrics`)).text();

		expect(body).toContain('route="/api/notes/{id}"');
		expect(body).not.toContain(id);
	});

	it("labels an unrouted request with the wildcard Hono matched, not with a blank", async (): Promise<void> => {
		await fetch(`${BASE_URL}/definitely-not-a-route`);

		const body = await (await fetch(`${BASE_URL}/metrics`)).text();

		expect(body).toContain('route="/*"');
		expect(body).toContain('status="404"');
	});

	it("leaves the probe paths uncounted", async (): Promise<void> => {
		await fetch(`${BASE_URL}/healthz`);

		const body = await (await fetch(`${BASE_URL}/metrics`)).text();

		expect(body).not.toContain('route="/healthz"');
		expect(body).not.toContain('route="/metrics"');
	});
});
