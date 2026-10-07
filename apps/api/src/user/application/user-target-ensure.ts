import { USER_MESSAGE } from "@app/messages";
import { Effect } from "effect";
import { roleWithinEnsure, type TCustomRoleRepoId } from "#/role/index.ts";
import { type EDatabase, type EForbidden, ENotFound } from "#/shared/errors.ts";
import type { TActorAuthority } from "#/shared/session.ts";
import {
	type TUserRepoId,
	type TUserRow,
	UserRepo,
} from "#/user/domain/user.ts";

export const userTargetEnsure = Effect.fn("userTargetEnsure")(function* (
	id: string,
	authority: TActorAuthority,
): Effect.fn.Return<
	TUserRow,
	ENotFound | EForbidden | EDatabase,
	TUserRepoId | TCustomRoleRepoId
> {
	const userRepo = yield* UserRepo;
	const target = yield* userRepo.findById(id);

	if (target === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	yield* roleWithinEnsure(
		authority,
		target.role,
		USER_MESSAGE.TARGET_BEYOND_ACTOR,
	);

	return target;
});
