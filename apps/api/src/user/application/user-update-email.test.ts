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
import { CustomRoleRepo, type TCustomRoleRepoId } from "#/role/index.ts";
import { userUpdate } from "#/user/application/user-update.ts";
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
	deactivatedAt: null,
	twoFactorEnabled: false,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

type TMocks = {
	update: Mock;
	sessionsRevoke: Mock;
	emailVerify: Mock;
};

const mocksBuild = (updated: TUserRow): TMocks => ({
	update: vi.fn().mockReturnValue(Effect.succeed(updated)),
	sessionsRevoke: vi.fn().mockReturnValue(Effect.void),
	emailVerify: vi.fn().mockReturnValue(Effect.void),
});

const layerBuild = (
	mocks: TMocks,
): Layer.Layer<
	TUserRepoId | TCustomRoleRepoId | TActivityRecorderId | TUserNotifierId
> =>
	Layer.mergeAll(
		Layer.succeed(
			UserRepo,
			userRepoFake({
				findById: vi.fn().mockReturnValue(Effect.succeed(row)),
				update: mocks.update,
				sessionsRevoke: mocks.sessionsRevoke,
			}),
		),
		Layer.succeed(
			CustomRoleRepo,
			CustomRoleRepo.of({
				memberCounts: vi.fn(),
				list: vi.fn(),
				findByKey: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
			}),
		),
		Layer.succeed(
			ActivityRecorder,
			ActivityRecorder.of({
				insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
			}),
		),
		Layer.succeed(
			UserNotifier,
			userNotifierFake({ emailVerify: mocks.emailVerify }),
		),
	);

describe("userUpdate email changes", () => {
	it("signs the user out and asks them to confirm a changed email", async (): Promise<void> => {
		const moved = { ...row, email: "moved@test.app", emailVerified: false };
		const mocks = mocksBuild(moved);

		await Effect.runPromise(
			userUpdate({ id: USER_ID, email: moved.email }, ACTOR_ID).pipe(
				Effect.provide(layerBuild(mocks)),
			),
		);

		expect(mocks.sessionsRevoke).toHaveBeenCalledWith(USER_ID);
		expect(mocks.emailVerify).toHaveBeenCalledWith(moved);
	});

	it("refuses to let the actor change their own email", async (): Promise<void> => {
		const mocks = mocksBuild(row);

		const error = await Effect.runPromise(
			userUpdate({ id: ACTOR_ID, email: "self@test.app" }, ACTOR_ID).pipe(
				Effect.flip,
				Effect.provide(layerBuild(mocks)),
			),
		);

		expect(error._tag).toBe("EForbidden");
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("leaves sessions alone when the email does not change", async (): Promise<void> => {
		const mocks = mocksBuild({ ...row, name: "Renamed" });

		await Effect.runPromise(
			userUpdate({ id: USER_ID, name: "Renamed" }, ACTOR_ID).pipe(
				Effect.provide(layerBuild(mocks)),
			),
		);

		expect(mocks.sessionsRevoke).not.toHaveBeenCalled();
		expect(mocks.emailVerify).not.toHaveBeenCalled();
	});
});
