import { METRIC_NAME } from "@app/metrics";
import { describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";

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

	it("counts the requests the suite has already made, by route and status", async (): Promise<void> => {
		await fetch(`${BASE_URL}/healthz`);

		const body = await (await fetch(`${BASE_URL}/metrics`)).text();

		expect(body).toContain(METRIC_NAME.HTTP_REQUESTS_TOTAL);
		expect(body).toContain('route="/healthz"');
		expect(body).toContain('status="200"');
	});

	it("labels by matched route rather than by path, so ids cannot multiply the series", async (): Promise<void> => {
		const body = await (await fetch(`${BASE_URL}/metrics`)).text();

		expect(body).not.toContain('route="/metrics/"');
		expect(body).toContain('route="/metrics"');
	});
});
