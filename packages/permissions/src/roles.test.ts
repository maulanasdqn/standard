import { describe, expect, it } from "vitest";
import { canAll, canAny } from "./can.ts";
import { PERMISSION } from "./permissions.ts";
import { permissionsForRole, ROLE } from "./roles.ts";

describe("permissionsForRole", () => {
	it("grants every permission to admin", (): void => {
		const granted = permissionsForRole(ROLE.ADMIN);
		expect(
			canAll(granted, [PERMISSION.NOTE_DELETE, PERMISSION.USER_MANAGE]),
		).toBe(true);
	});

	it("restricts viewer to read-only", (): void => {
		const granted = permissionsForRole(ROLE.VIEWER);
		expect(
			canAny(granted, [PERMISSION.NOTE_WRITE, PERMISSION.NOTE_DELETE]),
		).toBe(false);
		expect(canAll(granted, [PERMISSION.NOTE_READ])).toBe(true);
	});
});
