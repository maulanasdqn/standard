import { describe, expect, it } from "vitest";
import { listPathOf } from "#/libs/navigation/list-path.ts";

describe("listPathOf", () => {
	it("takes the first segment of a detail page", (): void => {
		expect(listPathOf("/users/abc/edit")).toBe("/users");
		expect(listPathOf("/notes/123")).toBe("/notes");
	});

	it("keeps a list page as it is", (): void => {
		expect(listPathOf("/roles")).toBe("/roles");
		expect(listPathOf("/roles/")).toBe("/roles");
	});

	it("falls back to the root when there is no segment", (): void => {
		expect(listPathOf("/")).toBe("/");
		expect(listPathOf("")).toBe("/");
	});
});
