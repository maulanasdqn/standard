import { PERMISSION, ROLE } from "@app/permissions";
import { Effect, Layer } from "effect";
import { type Mock, vi } from "vitest";
import { CustomRoleRepo, type TCustomRoleRepoId } from "#/role/index.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	type TUserNotifierId,
	userNotifierFakeLayer,
	userRepoFakeLayer,
} from "#/user/application/user-fakes.ts";
import type { TUserRepoId, TUserRow } from "#/user/domain/user.ts";

export const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
export const USER_ID = "11111111-1111-4111-8111-111111111111";
export const CUSTOM_ROLE = "reviewer";
export const NEW_NAME = "Renamed";

export const row: TUserRow = {
	id: USER_ID,
	name: "Member",
	email: "member@test.app",
	emailVerified: false,
	image: null,
	role: ROLE.MEMBER,
	deactivatedAt: null,
	twoFactorEnabled: false,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

export const customRole = {
	id: "33333333-3333-4333-8333-333333333333",
	key: CUSTOM_ROLE,
	label: "Reviewer",
	description: null,
	permissions: [PERMISSION.NOTE_READ],
	createdBy: null,
	createdAt: row.createdAt,
	updatedAt: row.updatedAt,
};

export type TMocks = {
	findById: Mock;
	update: Mock;
	findByKey: Mock;
	insert: Mock;
};

export const mocksBuild = (
	updated: TUserRow | null,
	roleFound: typeof customRole | null,
	previous: TUserRow | null = row,
): TMocks => ({
	findById: vi.fn().mockReturnValue(Effect.succeed(previous)),
	update: vi.fn().mockReturnValue(Effect.succeed(updated)),
	findByKey: vi.fn().mockReturnValue(Effect.succeed(roleFound)),
	insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
});

export const layerBuild = (
	mocks: TMocks,
): Layer.Layer<
	TUserRepoId | TCustomRoleRepoId | TActivityRecorderId | TUserNotifierId
> =>
	Layer.mergeAll(
		userRepoFakeLayer({ findById: mocks.findById, update: mocks.update }),
		Layer.succeed(
			CustomRoleRepo,
			CustomRoleRepo.of({
				memberCounts: vi.fn(),
				list: vi.fn(),
				findByKey: mocks.findByKey,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
			}),
		),
		Layer.succeed(
			ActivityRecorder,
			ActivityRecorder.of({ insert: mocks.insert }),
		),
		userNotifierFakeLayer(),
	);
