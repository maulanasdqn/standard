import { describe, expect, it } from "vitest";
import { permissionResourceOf } from "./resource.ts";

describe("permissionResourceOf", () => {
	it("takes the resource of a central app key", (): void => {
		expect(permissionResourceOf("note:read")).toBe("note");
	});

	it("keeps the app and the resource of another app's key", (): void => {
		expect(permissionResourceOf("crm:lead:read")).toBe("crm:lead");
	});

	it("falls back to the key itself when it has no action", (): void => {
		expect(permissionResourceOf("note")).toBe("note");
	});
});
