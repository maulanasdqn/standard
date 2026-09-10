import { ROLE_MESSAGE } from "@app/messages";
import type { TRoleCreateInput, TRoleDto } from "@app/schemas";
import { Effect } from "effect";
import { roleExists } from "#/application/role/role-ensure.ts";
import { toRoleDto } from "#/application/role/to-role-dto.ts";
import {
	ACTIVITY_ACTION,
	ACTIVITY_ENTITY_TYPE,
} from "#/application/shared/activity.ts";
import { EConflict, type EDatabase } from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { CustomRoleRepo } from "#/infrastructure/db/repositories/custom-role-repository.ts";

export const roleCreate = Effect.fn("roleCreate")(function* (
	input: TRoleCreateInput,
	actorId: string,
): Effect.fn.Return<
	TRoleDto,
	EConflict | EDatabase,
	CustomRoleRepo | ActivityRepo
> {
	const customRoleRepo = yield* CustomRoleRepo;
	const activityRepo = yield* ActivityRepo;

	const taken = yield* roleExists(input.key);

	if (taken) {
		return yield* new EConflict({ message: ROLE_MESSAGE.KEY_TAKEN });
	}

	const row = yield* customRoleRepo.create(input, actorId);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.ROLE_CREATE,
		entityType: ACTIVITY_ENTITY_TYPE.ROLE,
		entityId: row.key,
	});

	return toRoleDto(row, {});
});
