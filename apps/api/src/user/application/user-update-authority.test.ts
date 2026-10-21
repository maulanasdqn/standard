import {
	ADMIN_AUTHORITY,
	SUPERADMIN_AUTHORITY,
} from "#/shared/authority-fakes.ts";
import { ROLE } from "@app/permissions";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
	ACTOR_ID,
	layerBuild,
	mocksBuild,
	NEW_NAME,
	row,
	USER_ID,
} from "#/user/application/user-update-fakes.test-support.ts";
import { EForbidden } from "#/shared/errors.ts";
import { userUpdate } from "#/user/application/user-update.ts";

describe("userUpdate authority", () => {
	it("refuses to let the actor change their own role", async (): Promise<void> => {
		const mocks = mocksBuild(row, null);

		const error = await Effect.runPromise(
			userUpdate(
				{ id: ACTOR_ID, role: ROLE.VIEWER },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks)), Effect.flip),
		);

		expect(error).toBeInstanceOf(EForbidden);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("refuses to give a role beyond the actor's own", async (): Promise<void> => {
		const mocks = mocksBuild(row, null);

		const error = await Effect.runPromise(
			userUpdate(
				{ id: USER_ID, role: ROLE.SUPERADMIN },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks)), Effect.flip),
		);

		expect(error).toBeInstanceOf(EForbidden);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("refuses to change someone whose role is beyond the actor's own", async (): Promise<void> => {
		const mocks = mocksBuild(row, null, { ...row, role: ROLE.SUPERADMIN });

		const error = await Effect.runPromise(
			userUpdate(
				{ id: USER_ID, name: NEW_NAME },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks)), Effect.flip),
		);

		expect(error).toBeInstanceOf(EForbidden);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("lets a superadmin promote someone to superadmin", async (): Promise<void> => {
		const mocks = mocksBuild({ ...row, role: ROLE.SUPERADMIN }, null);

		await Effect.runPromise(
			userUpdate(
				{ id: USER_ID, role: ROLE.SUPERADMIN },
				ACTOR_ID,
				SUPERADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks))),
		);

		expect(mocks.update).toHaveBeenCalled();
	});
});
