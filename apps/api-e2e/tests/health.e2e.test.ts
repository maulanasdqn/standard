import { describe, expect, it } from "vitest";
import { client } from "../support/client.ts";

describe("health", () => {
	it("reports ok", async (): Promise<void> => {
		const result = await client.health.check();
		expect(result.status).toBe("ok");
	});
});
