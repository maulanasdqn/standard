import { ADMIN_AUTHORITY } from "#/shared/authority-fakes.ts";
import { ACTIVITY_ACTION, ACTIVITY_DETAIL } from "@app/activity";
import { PERMISSION, ROLE } from "@app/permissions";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
	ACTOR_ID,
	input,
	KEY,
	layerBuild,
	MEMBERS,
	mocksBuild,
	previousRow,
	row,
} from "#/role/application/role-update-fakes.test-support.ts";
import { roleUpdate } from "#/role/application/role-update.ts";
import { EBadRequest, ENotFound } from "#/shared/errors.ts";

describe("roleUpdate", () => {
	it("refuses to change a fixed role", async (): Promise<void> => {
		const mocks = mocksBuild(row, {});

		const error = await Effect.runPromise(
			roleUpdate(
				{ ...input, key: ROLE.MEMBER },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks)), Effect.flip),
		);

		expect(error).toBeInstanceOf(EBadRequest);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("fails with ENotFound when the custom role does not exist", async (): Promise<void> => {
		const mocks = mocksBuild(null, {}, null);

		const error = await Effect.runPromise(
			roleUpdate(input, ACTOR_ID, ADMIN_AUTHORITY).pipe(
				Effect.provide(layerBuild(mocks)),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(ENotFound);
		expect(mocks.insert).not.toHaveBeenCalled();
	});

	it("updates the role, logs the activity and reports the member count", async (): Promise<void> => {
		const mocks = mocksBuild(row, { [KEY]: MEMBERS });

		const result = await Effect.runPromise(
			roleUpdate(input, ACTOR_ID, ADMIN_AUTHORITY).pipe(
				Effect.provide(layerBuild(mocks)),
			),
		);

		expect(result).toMatchObject({
			key: KEY,
			label: input.label,
			permissions: input.permissions,
			memberCount: MEMBERS,
		});
		expect(mocks.update).toHaveBeenCalledWith(input);
		expect(mocks.insert).toHaveBeenCalledWith(
			expect.objectContaining({
				action: ACTIVITY_ACTION.ROLE_UPDATE,
				resourceId: KEY,
				metadata: {
					[ACTIVITY_DETAIL.LABEL]: input.label,
					[ACTIVITY_DETAIL.PREVIOUS_LABEL]: previousRow.label,
					[ACTIVITY_DETAIL.PERMISSIONS_ADDED]: PERMISSION.NOTE_UPDATE,
					[ACTIVITY_DETAIL.PERMISSIONS_REMOVED]: PERMISSION.USER_DELETE,
				},
			}),
		);
	});

	it("leaves out the label and permission changes when nothing changed", async (): Promise<void> => {
		const mocks = mocksBuild(row, {}, row);

		await Effect.runPromise(
			roleUpdate(input, ACTOR_ID, ADMIN_AUTHORITY).pipe(
				Effect.provide(layerBuild(mocks)),
			),
		);

		expect(mocks.insert).toHaveBeenCalledWith(
			expect.objectContaining({
				metadata: { [ACTIVITY_DETAIL.LABEL]: input.label },
			}),
		);
	});
});
