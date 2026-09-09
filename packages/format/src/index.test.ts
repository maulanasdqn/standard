import { describe, expect, it } from "vitest";
import { formatUsd, orDash } from "./index.ts";

describe("orDash", () => {
	it("returns the em dash for empty values", () => {
		expect(orDash(null)).toBe("—");
		expect(orDash(undefined)).toBe("—");
		expect(orDash("")).toBe("—");
	});

	it("stringifies present values", () => {
		expect(orDash(42)).toBe("42");
	});
});

describe("formatUsd", () => {
	it("formats cents as dollars", () => {
		expect(formatUsd(1050)).toBe("$10.50");
	});
});
