import { describe, expect, it } from "vitest";
import { originAllowed, originsOf } from "#/platform/http/origins.ts";

const WEB_ORIGIN = "https://app.example.test";
const WILDCARD = "https://*.example.test";

describe("originsOf", () => {
	it("keeps the web origin first and drops duplicates", (): void => {
		expect(originsOf(WEB_ORIGIN, [WILDCARD, WEB_ORIGIN])).toEqual([
			WEB_ORIGIN,
			WILDCARD,
		]);
	});
});

describe("originAllowed", () => {
	it("accepts an exact origin", (): void => {
		expect(originAllowed(WEB_ORIGIN, [WEB_ORIGIN])).toBe(true);
	});

	it("accepts a subdomain through a wildcard", (): void => {
		expect(originAllowed("https://reports.example.test", [WILDCARD])).toBe(
			true,
		);
	});

	it("rejects an origin that only contains the pattern", (): void => {
		expect(
			originAllowed("https://app.example.test.attacker.test", [
				WEB_ORIGIN,
				WILDCARD,
			]),
		).toBe(false);
	});

	it("rejects a wildcard reaching across a path", (): void => {
		expect(originAllowed("https://x/y.example.test", [WILDCARD])).toBe(false);
	});

	it("rejects an empty origin", (): void => {
		expect(originAllowed("", [WEB_ORIGIN, WILDCARD])).toBe(false);
	});
});
