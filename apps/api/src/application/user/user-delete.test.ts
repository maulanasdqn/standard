import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { EForbidden } from "#/application/shared/errors.ts";
import { userDelete } from "#/application/user/user-delete.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

const ACTOR_ID = "22222222-2222-4222-8222-222222222222";

describe("userDelete", () => {
	it("refuses to delete the acting user", async (): Promise<void> => {
		const remove = vi.fn();
		const testLayer = Layer.mergeAll(
			Layer.succeed(
				UserRepo,
				UserRepo.of({
					list: vi.fn(),
					findById: vi.fn(),
					findByEmail: vi.fn(),
					create: vi.fn(),
					update: vi.fn(),
					remove,
					countByRole: vi.fn(),
				}),
			),
			Layer.succeed(ActivityRepo, ActivityRepo.of({ insert: vi.fn() })),
		);

		const error = await Effect.runPromise(
			userDelete({ id: ACTOR_ID }, ACTOR_ID).pipe(
				Effect.provide(testLayer),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(EForbidden);
		expect(remove).not.toHaveBeenCalled();
	});
});
