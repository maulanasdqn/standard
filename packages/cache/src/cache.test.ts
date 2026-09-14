import { describe, expect, it } from "vitest";
import { cacheClientFake } from "./cache-client-fake.ts";
import { cacheCreate } from "./cache.ts";

describe("cacheCreate", () => {
	it("returns null for a key that was never written", async () => {
		const cache = cacheCreate(cacheClientFake());

		await expect(cache.get("absent")).resolves.toBeNull();
	});

	it("round-trips a structured value and records its ttl", async () => {
		const client = cacheClientFake();
		const cache = cacheCreate(client);

		await cache.set("role:admin", { permissions: ["note:read"] }, 60);

		await expect(cache.get("role:admin")).resolves.toEqual({
			permissions: ["note:read"],
		});
		expect(client.expiries.get("role:admin")).toBe(60);
	});

	it("returns null once a key is deleted", async () => {
		const cache = cacheCreate(cacheClientFake());

		await cache.set("role:admin", { permissions: [] }, 60);
		await cache.del("role:admin");

		await expect(cache.get("role:admin")).resolves.toBeNull();
	});
});
