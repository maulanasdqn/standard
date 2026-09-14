import { USER_MESSAGE } from "@app/messages";
import type { TUser, TUserCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { roleEnsure } from "#/application/role/role-ensure.ts";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import {
	type EAuth,
	type EBadRequest,
	EConflict,
	type EDatabase,
} from "#/domain/shared/errors.ts";
import { toUserDto } from "#/application/user/to-user-dto.ts";
import {
	ActivityRepo,
	type TActivityRepoId,
} from "#/domain/activity/activity.ts";
import type { TCustomRoleRepoId } from "#/domain/role/custom-role.ts";
import { UserRepo, type TUserRepoId } from "#/domain/user/user.ts";

export const userCreate = Effect.fn("userCreate")(function* (
	input: TUserCreateInput,
	actorId: string,
): Effect.fn.Return<
	TUser,
	EConflict | EBadRequest | EDatabase | EAuth,
	TUserRepoId | TCustomRoleRepoId | TActivityRepoId
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRepo;

	yield* roleEnsure(input.role);

	const existing = yield* userRepo.findByEmail(input.email);

	if (existing !== null) {
		return yield* new EConflict({ message: USER_MESSAGE.EMAIL_TAKEN });
	}

	const row = yield* userRepo.create(input);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: row.id,
	});

	return toUserDto(row);
});
