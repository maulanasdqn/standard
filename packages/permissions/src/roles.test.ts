import { describe, expect, it } from "vitest";
import { canAll, canAny } from "./can.ts";
import { PERMISSION } from "./permissions.ts";
import { permissionsForRole, ROLE } from "./roles.ts";

describe("permissionsForRole", () => {
	it("grants every permission to superadmin", (): void => {
		const granted = permissionsForRole(ROLE.SUPERADMIN);
		expect(
			canAll(granted, [
				PERMISSION.NOTE_DELETE,
				PERMISSION.USER_DELETE,
				PERMISSION.ROLE_UPDATE,
			]),
		).toBe(true);
	});

	it("grants every permission to admin", (): void => {
		const granted = permissionsForRole(ROLE.ADMIN);
		expect(
			canAll(granted, [
				PERMISSION.NOTE_DELETE,
				PERMISSION.USER_DELETE,
				PERMISSION.ROLE_UPDATE,
			]),
		).toBe(true);
	});

	it("restricts viewer to read-only", (): void => {
		const granted = permissionsForRole(ROLE.VIEWER);
		expect(
			canAny(granted, [
				PERMISSION.NOTE_CREATE,
				PERMISSION.NOTE_UPDATE,
				PERMISSION.NOTE_DELETE,
			]),
		).toBe(false);
		expect(canAll(granted, [PERMISSION.NOTE_READ])).toBe(true);
	});

	it("lets member create, read and update notes but not delete them", (): void => {
		const granted = permissionsForRole(ROLE.MEMBER);
		expect(
			canAll(granted, [
				PERMISSION.NOTE_CREATE,
				PERMISSION.NOTE_READ,
				PERMISSION.NOTE_UPDATE,
			]),
		).toBe(true);
		expect(
			canAny(granted, [PERMISSION.NOTE_DELETE, PERMISSION.USER_READ]),
		).toBe(false);
	});
});
