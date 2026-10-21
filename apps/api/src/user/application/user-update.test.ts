import { ADMIN_AUTHORITY } from "#/shared/authority-fakes.ts";
import { ACTIVITY_ACTION, ACTIVITY_DETAIL } from "@app/activity";
import { ROLE } from "@app/permissions";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
	ACTOR_ID,
	CUSTOM_ROLE,
	customRole,
	layerBuild,
	mocksBuild,
	NEW_NAME,
	row,
	USER_ID,
} from "#/user/application/user-update-fakes.test-support.ts";
import { EBadRequest, ENotFound } from "#/shared/errors.ts";
import { userUpdate } from "#/user/application/user-update.ts";

describe("userUpdate", () => {
	it("lets the actor rename themselves", async (): Promise<void> => {
		const mocks = mocksBuild({ ...row, id: ACTOR_ID, name: NEW_NAME }, null, {
			...row,
			id: ACTOR_ID,
		});

		const result = await Effect.runPromise(
			userUpdate(
				{ id: ACTOR_ID, name: NEW_NAME },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks))),
		);

		expect(result.name).toBe(NEW_NAME);
		expect(mocks.update).toHaveBeenCalledWith({ id: ACTOR_ID, name: NEW_NAME });
	});

	it("rejects a role that does not exist before touching the user", async (): Promise<void> => {
		const mocks = mocksBuild(row, null);

		const error = await Effect.runPromise(
			userUpdate(
				{ id: USER_ID, role: "ghost" },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks)), Effect.flip),
		);

		expect(error).toBeInstanceOf(EBadRequest);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("fails with ENotFound when the user is gone", async (): Promise<void> => {
		const mocks = mocksBuild(null, null, null);

		const error = await Effect.runPromise(
			userUpdate(
				{ id: USER_ID, name: NEW_NAME },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks)), Effect.flip),
		);

		expect(error).toBeInstanceOf(ENotFound);
		expect(mocks.insert).not.toHaveBeenCalled();
	});

	it("assigns a custom role and records it in the activity", async (): Promise<void> => {
		const mocks = mocksBuild({ ...row, role: CUSTOM_ROLE }, customRole);

		const result = await Effect.runPromise(
			userUpdate(
				{ id: USER_ID, role: CUSTOM_ROLE },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks))),
		);

		expect(result.role).toBe(CUSTOM_ROLE);
		expect(mocks.findByKey).toHaveBeenCalledWith(
			CUSTOM_ROLE,
			expect.anything(),
		);
		expect(mocks.insert).toHaveBeenCalledWith(
			expect.objectContaining({
				action: ACTIVITY_ACTION.USER_UPDATE,
				resourceId: USER_ID,
				metadata: {
					[ACTIVITY_DETAIL.ROLE]: CUSTOM_ROLE,
					[ACTIVITY_DETAIL.PREVIOUS_ROLE]: ROLE.MEMBER,
				},
			}),
		);
	});

	it("skips the role lookup and records only the rename when only the name changes", async (): Promise<void> => {
		const mocks = mocksBuild({ ...row, name: NEW_NAME }, null);

		await Effect.runPromise(
			userUpdate(
				{ id: USER_ID, name: NEW_NAME },
				ACTOR_ID,
				ADMIN_AUTHORITY,
			).pipe(Effect.provide(layerBuild(mocks))),
		);

		expect(mocks.findByKey).not.toHaveBeenCalled();
		expect(mocks.insert).toHaveBeenCalledWith(
			expect.objectContaining({
				metadata: {
					[ACTIVITY_DETAIL.NAME]: NEW_NAME,
					[ACTIVITY_DETAIL.PREVIOUS_NAME]: row.name,
				},
			}),
		);
	});
});
