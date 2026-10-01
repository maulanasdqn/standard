import { ACTIVITY_ACTION } from "@app/activity";
import { ROLE } from "@app/permissions";
import { Effect, Layer } from "effect";
import {
	userRepoFake,
	userNotifierFake,
} from "#/user/application/user-fakes.ts";
import { describe, expect, it, type Mock, vi } from "vitest";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { userDeactivate } from "#/user/application/user-deactivate.ts";
import {
	type TUserRepoId,
	type TUserRow,
	UserRepo,
} from "#/user/domain/user.ts";
import {
	type TUserNotifierId,
	UserNotifier,
} from "#/user/domain/user-notifier.ts";

const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "11111111-1111-4111-8111-111111111111";

const row: TUserRow = {
	id: USER_ID,
	name: "Member",
	email: "member@test.app",
	emailVerified: true,
	image: null,
	role: ROLE.MEMBER,
	deactivatedAt: new Date("2026-01-02T00:00:00Z"),
	twoFactorEnabled: false,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

type TMocks = {
	deactivate: Mock;
	insert: Mock;
	deactivated: Mock;
};

const mocksBuild = (result: TUserRow | null): TMocks => ({
	deactivate: vi.fn().mockReturnValue(Effect.succeed(result)),
	insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
	deactivated: vi.fn().mockReturnValue(Effect.void),
});

const layerBuild = (
	mocks: TMocks,
): Layer.Layer<TUserRepoId | TActivityRecorderId | TUserNotifierId> =>
	Layer.mergeAll(
		Layer.succeed(UserRepo, userRepoFake({ deactivate: mocks.deactivate })),
		Layer.succeed(
			ActivityRecorder,
			ActivityRecorder.of({ insert: mocks.insert }),
		),
		Layer.succeed(
			UserNotifier,
			userNotifierFake({ deactivated: mocks.deactivated }),
		),
	);

describe("userDeactivate", () => {
	it("refuses to let the actor deactivate themselves", async (): Promise<void> => {
		const mocks = mocksBuild(row);

		const error = await Effect.runPromise(
			userDeactivate({ id: ACTOR_ID }, ACTOR_ID).pipe(
				Effect.flip,
				Effect.provide(layerBuild(mocks)),
			),
		);

		expect(error._tag).toBe("EForbidden");
		expect(mocks.deactivate).not.toHaveBeenCalled();
	});

	it("reports a user that does not exist", async (): Promise<void> => {
		const mocks = mocksBuild(null);

		const error = await Effect.runPromise(
			userDeactivate({ id: USER_ID }, ACTOR_ID).pipe(
				Effect.flip,
				Effect.provide(layerBuild(mocks)),
			),
		);

		expect(error._tag).toBe("ENotFound");
		expect(mocks.deactivated).not.toHaveBeenCalled();
	});

	it("deactivates, records the actor and tells the user", async (): Promise<void> => {
		const mocks = mocksBuild(row);

		const result = await Effect.runPromise(
			userDeactivate({ id: USER_ID }, ACTOR_ID).pipe(
				Effect.provide(layerBuild(mocks)),
			),
		);

		expect(result.deactivatedAt).toBe(row.deactivatedAt?.toISOString());
		expect(mocks.insert).toHaveBeenCalledWith(
			expect.objectContaining({
				actorId: ACTOR_ID,
				action: ACTIVITY_ACTION.USER_DEACTIVATE,
				resourceId: USER_ID,
			}),
		);
		expect(mocks.deactivated).toHaveBeenCalledWith(row);
	});
});
