import { PERMISSION, ROLE } from "@app/permissions";
import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import {
	permissionsWithin,
	roleWithin,
	roleWithinEnsure,
} from "#/role/application/role-authority.ts";
import {
	CustomRoleRepo,
	type TCustomRoleRepoId,
	type TCustomRoleRow,
} from "#/role/domain/custom-role.ts";
import {
	ADMIN_AUTHORITY,
	SUPERADMIN_AUTHORITY,
	USER_MANAGER_AUTHORITY,
} from "#/shared/authority-fakes.ts";
import { EForbidden } from "#/shared/errors.ts";

const REFUSED = "refused";

const customRow = (
	key: string,
	permissions: TCustomRoleRow["permissions"],
): TCustomRoleRow => ({
	id: "11111111-1111-4111-8111-111111111111",
	key,
	label: key,
	description: null,
	permissions,
	createdBy: null,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
});

const layerOf = (row: TCustomRoleRow | null): Layer.Layer<TCustomRoleRepoId> =>
	Layer.succeed(
		CustomRoleRepo,
		CustomRoleRepo.of({
			memberCounts: vi.fn(),
			list: vi.fn(),
			findByKey: vi.fn().mockReturnValue(Effect.succeed(row)),
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
		}),
	);

const within = (
	authority: typeof ADMIN_AUTHORITY,
	role: string,
	row: TCustomRoleRow | null = null,
): Promise<boolean> =>
	Effect.runPromise(
		roleWithin(authority, role).pipe(Effect.provide(layerOf(row))),
	);

describe("roleWithin", () => {
	it("leaves the superadmin role to superadmins", async (): Promise<void> => {
		expect(await within(SUPERADMIN_AUTHORITY, ROLE.SUPERADMIN)).toBe(true);
		expect(await within(ADMIN_AUTHORITY, ROLE.SUPERADMIN)).toBe(false);
	});

	it("lets an actor reach a fixed role whose permissions it holds", async (): Promise<void> => {
		expect(await within(ADMIN_AUTHORITY, ROLE.ADMIN)).toBe(true);
		expect(await within(USER_MANAGER_AUTHORITY, ROLE.VIEWER)).toBe(false);
		expect(await within(USER_MANAGER_AUTHORITY, ROLE.ADMIN)).toBe(false);
	});

	it("compares a custom role by the permissions stored for it", async (): Promise<void> => {
		const readers = customRow("readers", [PERMISSION.USER_READ]);
		const writers = customRow("writers", [PERMISSION.NOTE_CREATE]);

		expect(await within(USER_MANAGER_AUTHORITY, readers.key, readers)).toBe(
			true,
		);
		expect(await within(USER_MANAGER_AUTHORITY, writers.key, writers)).toBe(
			false,
		);
	});
});

describe("roleWithinEnsure", () => {
	it("fails with EForbidden and the given message when the role is out of reach", async (): Promise<void> => {
		const error = await Effect.runPromise(
			roleWithinEnsure(ADMIN_AUTHORITY, ROLE.SUPERADMIN, REFUSED).pipe(
				Effect.provide(layerOf(null)),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(EForbidden);
		expect(error.message).toBe(REFUSED);
	});
});

describe("permissionsWithin", () => {
	it("is true only when the actor holds every permission", (): void => {
		expect(
			permissionsWithin(USER_MANAGER_AUTHORITY, [PERMISSION.USER_READ]),
		).toBe(true);
		expect(
			permissionsWithin(USER_MANAGER_AUTHORITY, [
				PERMISSION.USER_READ,
				PERMISSION.ROLE_DELETE,
			]),
		).toBe(false);
	});
});
