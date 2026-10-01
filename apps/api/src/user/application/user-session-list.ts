import { USER_MESSAGE } from "@app/messages";
import type { TUserIdInput, TUserSessionList } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";
import { UserRepo, type TUserRepoId } from "#/user/domain/user.ts";

export const userSessionList = Effect.fn("userSessionList")(function* (
	input: TUserIdInput,
): Effect.fn.Return<TUserSessionList, ENotFound | EDatabase, TUserRepoId> {
	const userRepo = yield* UserRepo;

	const existing = yield* userRepo.findById(input.id);

	if (existing === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	const rows = yield* userRepo.sessions(input.id);

	return A.map(rows, (row) => ({
		id: row.id,
		ipAddress: row.ipAddress,
		userAgent: row.userAgent,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		expiresAt: row.expiresAt.toISOString(),
	}));
});
