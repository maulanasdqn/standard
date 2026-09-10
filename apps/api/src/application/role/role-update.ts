import { ROLE_MESSAGE } from "@app/messages";
import { isRole } from "@app/permissions";
import type { TRoleDto, TRoleUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import { toRoleDto } from "#/application/role/to-role-dto.ts";
import { ACTIVITY_ACTION, ACTIVITY_ENTITY_TYPE } from "@app/activity";
import {
	EBadRequest,
	type EDatabase,
	ENotFound,
} from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { CustomRoleRepo } from "#/infrastructure/db/repositories/custom-role-repository.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

export const roleUpdate = Effect.fn("roleUpdate")(function* (
	input: TRoleUpdateInput,
	actorId: string,
): Effect.fn.Return<
	TRoleDto,
	ENotFound | EBadRequest | EDatabase,
	CustomRoleRepo | UserRepo | ActivityRepo
> {
	const customRoleRepo = yield* CustomRoleRepo;
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRepo;

	if (isRole(input.key)) {
		return yield* new EBadRequest({ message: ROLE_MESSAGE.FIXED });
	}

	const updated = yield* customRoleRepo.update(input);

	if (updated === null) {
		return yield* new ENotFound({ message: ROLE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.ROLE_UPDATE,
		entityType: ACTIVITY_ENTITY_TYPE.ROLE,
		entityId: updated.key,
	});

	const counts = yield* userRepo.countByRole();
	return toRoleDto(updated, counts);
});
