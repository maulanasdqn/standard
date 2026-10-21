import {
	ADMIN_AUTHORITY,
	USER_MANAGER_AUTHORITY,
} from "#/shared/authority-fakes.ts";
import { PERMISSION } from "@app/permissions";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
	ACTOR_ID,
	input,
	KEY,
	layerBuild,
	mocksBuild,
	previousRow,
	row,
} from "#/role/application/role-update-fakes.test-support.ts";
import { roleUpdate } from "#/role/application/role-update.ts";
import { EForbidden } from "#/shared/errors.ts";

describe("roleUpdate authority", () => {
	it("refuses to change the role the actor holds", async (): Promise<void> => {
		const mocks = mocksBuild(row, {});

		const error = await Effect.runPromise(
			roleUpdate(input, ACTOR_ID, { ...ADMIN_AUTHORITY, role: KEY }).pipe(
				Effect.provide(layerBuild(mocks)),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(EForbidden);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("refuses to add a permission the actor does not hold", async (): Promise<void> => {
		const mocks = mocksBuild(row, {}, { ...previousRow, permissions: [] });

		const error = await Effect.runPromise(
			roleUpdate(
				{ key: KEY, permissions: [PERMISSION.ROLE_DELETE] },
				ACTOR_ID,
				USER_MANAGER_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks)), Effect.flip),
		);

		expect(error).toBeInstanceOf(EForbidden);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("refuses to edit a role that holds more than the actor", async (): Promise<void> => {
		const mocks = mocksBuild(row, {});

		const error = await Effect.runPromise(
			roleUpdate(
				{ key: KEY, label: "Renamed" },
				ACTOR_ID,
				USER_MANAGER_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks)), Effect.flip),
		);

		expect(error).toBeInstanceOf(EForbidden);
		expect(mocks.update).not.toHaveBeenCalled();
	});
});
