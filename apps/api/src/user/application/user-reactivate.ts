import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetails,
} from "@app/activity";
import { USER_MESSAGE } from "@app/messages";
import type { TUser, TUserIdInput } from "@app/schemas";
import { Effect } from "effect";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";
import { toUserDto } from "#/user/application/to-user-dto.ts";
import { UserRepo, type TUserRepoId } from "#/user/domain/user.ts";
import type { TActorAuthority } from "#/shared/session.ts";
import { userTargetEnsure } from "#/user/application/user-target-ensure.ts";
import type { TCustomRoleRepoId } from "#/role/index.ts";
import type { EForbidden } from "#/shared/errors.ts";

export const userReactivate = Effect.fn("userReactivate")(function* (
	input: TUserIdInput,
	actorId: string,
	authority: TActorAuthority,
): Effect.fn.Return<
	TUser,
	ENotFound | EForbidden | EDatabase,
	TUserRepoId | TActivityRecorderId | TCustomRoleRepoId
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRecorder;

	yield* userTargetEnsure(input.id, authority);

	const row = yield* userRepo.reactivate(input.id);

	if (row === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_REACTIVATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: row.id,
		metadata: activityDetails({ [ACTIVITY_DETAIL.EMAIL]: row.email }),
	});

	return toUserDto(row);
});
