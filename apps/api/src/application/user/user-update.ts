import { USER_MESSAGE } from "@app/messages";
import type { TUser, TUserUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import { match, P } from "ts-pattern";
import { roleEnsure } from "#/application/role/role-ensure.ts";
import { ACTIVITY_ACTION, ACTIVITY_ENTITY_TYPE } from "@app/activity";
import {
	type EBadRequest,
	type EDatabase,
	EForbidden,
	ENotFound,
} from "#/application/shared/errors.ts";
import { toUserDto } from "#/application/user/to-user-dto.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import type { CustomRoleRepo } from "#/infrastructure/db/repositories/custom-role-repository.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

export const userUpdate = Effect.fn("userUpdate")(function* (
	input: TUserUpdateInput,
	actorId: string,
): Effect.fn.Return<
	TUser,
	ENotFound | EForbidden | EBadRequest | EDatabase,
	UserRepo | CustomRoleRepo | ActivityRepo
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRepo;

	if (input.role !== undefined && input.id === actorId) {
		return yield* new EForbidden({ message: USER_MESSAGE.SELF_ROLE_CHANGE });
	}

	yield* match(input.role)
		.with(P.nullish, () => Effect.void)
		.otherwise((role) => roleEnsure(role));

	const updated = yield* userRepo.update(input);

	if (updated === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_UPDATE,
		entityType: ACTIVITY_ENTITY_TYPE.USER,
		entityId: updated.id,
	});

	return toUserDto(updated);
});
