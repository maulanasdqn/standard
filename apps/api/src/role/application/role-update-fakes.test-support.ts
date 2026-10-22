import { PERMISSION } from "@app/permissions";
import type { TRoleUpdateInput } from "@app/schemas";
import { Effect, Layer } from "effect";
import { type Mock, vi } from "vitest";
import {
	CustomRoleRepo,
	type TCustomRoleRepoId,
	type TCustomRoleRow,
	type TRoleMemberCounts,
} from "#/role/domain/custom-role.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";

export const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
export const KEY = "reviewer";
export const MEMBERS = 3;

export const input: TRoleUpdateInput = {
	key: KEY,
	label: "Reviewer Plus",
	permissions: [PERMISSION.NOTE_READ, PERMISSION.NOTE_UPDATE],
};

export const row: TCustomRoleRow = {
	id: "11111111-1111-4111-8111-111111111111",
	key: KEY,
	label: input.label ?? "",
	description: null,
	permissions: input.permissions ?? [],
	createdBy: ACTOR_ID,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

export const previousRow: TCustomRoleRow = {
	...row,
	label: "Reviewer",
	permissions: [PERMISSION.NOTE_READ, PERMISSION.USER_DELETE],
};

export type TMocks = {
	findByKey: Mock;
	update: Mock;
	memberCounts: Mock;
	insert: Mock;
};

export const mocksBuild = (
	updated: TCustomRoleRow | null,
	counts: TRoleMemberCounts,
	previous: TCustomRoleRow | null = previousRow,
): TMocks => ({
	findByKey: vi.fn().mockReturnValue(Effect.succeed(previous)),
	update: vi.fn().mockReturnValue(Effect.succeed(updated)),
	memberCounts: vi.fn().mockReturnValue(Effect.succeed(counts)),
	insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
});

export const layerBuild = (
	mocks: TMocks,
): Layer.Layer<TCustomRoleRepoId | TActivityRecorderId> =>
	Layer.mergeAll(
		Layer.succeed(
			CustomRoleRepo,
			CustomRoleRepo.of({
				memberCounts: mocks.memberCounts,
				list: vi.fn(),
				findByKey: mocks.findByKey,
				create: vi.fn(),
				update: mocks.update,
				remove: vi.fn(),
			}),
		),
		Layer.succeed(
			ActivityRecorder,
			ActivityRecorder.of({ insert: mocks.insert }),
		),
	);
