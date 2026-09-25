import { ACTIVITY_ACTION } from "@app/activity";
import { PERMISSION, ROLE } from "@app/permissions";
import type { TRoleUpdateInput } from "@app/schemas";
import { Effect, Layer } from "effect";
import { describe, expect, it, type Mock, vi } from "vitest";
import { roleUpdate } from "#/role/application/role-update.ts";
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
import { EBadRequest, ENotFound } from "#/shared/errors.ts";

const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
const KEY = "reviewer";
const MEMBERS = 3;

const input: TRoleUpdateInput = {
	key: KEY,
	label: "Reviewer Plus",
	permissions: [PERMISSION.NOTE_READ, PERMISSION.NOTE_WRITE],
};

const row: TCustomRoleRow = {
	id: "11111111-1111-4111-8111-111111111111",
	key: KEY,
	label: input.label ?? "",
	description: null,
	permissions: input.permissions ?? [],
	createdBy: ACTOR_ID,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

type TMocks = { update: Mock; memberCounts: Mock; insert: Mock };

const mocksBuild = (
	updated: TCustomRoleRow | null,
	counts: TRoleMemberCounts,
): TMocks => ({
	update: vi.fn().mockReturnValue(Effect.succeed(updated)),
	memberCounts: vi.fn().mockReturnValue(Effect.succeed(counts)),
	insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
});

const layerBuild = (
	mocks: TMocks,
): Layer.Layer<TCustomRoleRepoId | TActivityRecorderId> =>
	Layer.mergeAll(
		Layer.succeed(
			CustomRoleRepo,
			CustomRoleRepo.of({
				memberCounts: mocks.memberCounts,
				list: vi.fn(),
				findByKey: vi.fn(),
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

describe("roleUpdate", () => {
	it("refuses to change a fixed role", async (): Promise<void> => {
		const mocks = mocksBuild(row, {});

		const error = await Effect.runPromise(
			roleUpdate({ ...input, key: ROLE.MEMBER }, ACTOR_ID).pipe(
				Effect.provide(layerBuild(mocks)),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(EBadRequest);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("fails with ENotFound when the custom role does not exist", async (): Promise<void> => {
		const mocks = mocksBuild(null, {});

		const error = await Effect.runPromise(
			roleUpdate(input, ACTOR_ID).pipe(
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
			roleUpdate(input, ACTOR_ID).pipe(Effect.provide(layerBuild(mocks))),
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
			}),
		);
	});
});
