import { ROLE_MESSAGE } from "@app/messages";
import type { TRoleCreateInput, TRoleDto } from "@app/schemas";
import { Effect } from "effect";
import { roleExists } from "#/application/role/role-ensure.ts";
import { toRoleDto } from "#/application/role/to-role-dto.ts";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EConflict, type EDatabase } from "#/domain/shared/errors.ts";
import {
	ActivityRepo,
	type TActivityRepoId,
} from "#/domain/activity/activity.ts";
import {
	CustomRoleRepo,
	type TCustomRoleRepoId,
} from "#/domain/role/custom-role.ts";

export const roleCreate = Effect.fn("roleCreate")(function* (
	input: TRoleCreateInput,
	actorId: string,
): Effect.fn.Return<
	TRoleDto,
	EConflict | EDatabase,
	TCustomRoleRepoId | TActivityRepoId
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
		resourceType: ACTIVITY_RESOURCE_TYPE.ROLE,
		resourceId: row.key,
	});

	return toRoleDto(row, {});
});
