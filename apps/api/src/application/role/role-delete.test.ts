import { ROLE } from "@app/permissions";
import { Effect, Layer } from "effect";
import { describe, expect, it, type Mock, vi } from "vitest";
import { roleDelete } from "#/application/role/role-delete.ts";
import { EBadRequest, EConflict } from "#/application/shared/errors.ts";
import type { TRoleMemberCounts } from "#/domain/user/user.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { CustomRoleRepo } from "#/infrastructure/db/repositories/custom-role-repository.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

const ACTOR_ID = "22222222-2222-4222-8222-222222222222";

const layerBuild = (
	remove: Mock,
	counts: TRoleMemberCounts,
): Layer.Layer<UserRepo | CustomRoleRepo | ActivityRepo> =>
	Layer.mergeAll(
		Layer.succeed(
			UserRepo,
			UserRepo.of({
				list: vi.fn(),
				findById: vi.fn(),
				findByEmail: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				countByRole: vi.fn().mockReturnValue(Effect.succeed(counts)),
			}),
		),
		Layer.succeed(
			CustomRoleRepo,
			CustomRoleRepo.of({
				list: vi.fn(),
				findByKey: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				remove,
			}),
		),
		Layer.succeed(
			ActivityRepo,
			ActivityRepo.of({ insert: vi.fn(), list: vi.fn() }),
		),
	);

describe("roleDelete", () => {
	it("refuses to delete a fixed role", async (): Promise<void> => {
		const remove = vi.fn();

		const error = await Effect.runPromise(
			roleDelete({ key: ROLE.ADMIN }, ACTOR_ID).pipe(
				Effect.provide(layerBuild(remove, {})),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(EBadRequest);
		expect(remove).not.toHaveBeenCalled();
	});

	it("refuses to delete a custom role that still has members", async (): Promise<void> => {
		const remove = vi.fn();

		const error = await Effect.runPromise(
			roleDelete({ key: "reviewer" }, ACTOR_ID).pipe(
				Effect.provide(layerBuild(remove, { reviewer: 2 })),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(EConflict);
		expect(remove).not.toHaveBeenCalled();
	});
});
