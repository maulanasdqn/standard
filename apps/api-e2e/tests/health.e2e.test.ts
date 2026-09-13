import { APP_VERSION } from "@app/version";
import { describe, expect, it } from "vitest";
import { client } from "../support/client.ts";

describe("health", () => {
	it("reports ok with the centralized version", async (): Promise<void> => {
		const result = await client.health.check();
		expect(result.status).toBe("ok");
		expect(result.version).toBe(APP_VERSION);
	});
});
