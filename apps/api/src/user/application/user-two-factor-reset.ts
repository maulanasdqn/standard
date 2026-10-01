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
import { type EDatabase, EForbidden, ENotFound } from "#/shared/errors.ts";
import { toUserDto } from "#/user/application/to-user-dto.ts";
import { UserRepo, type TUserRepoId } from "#/user/domain/user.ts";
import {
	type TUserNotifierId,
	UserNotifier,
} from "#/user/domain/user-notifier.ts";

export const userTwoFactorReset = Effect.fn("userTwoFactorReset")(function* (
	input: TUserIdInput,
	actorId: string,
): Effect.fn.Return<
	TUser,
	ENotFound | EForbidden | EDatabase,
	TUserRepoId | TActivityRecorderId | TUserNotifierId
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRecorder;
	const notifier = yield* UserNotifier;

	if (input.id === actorId) {
		return yield* new EForbidden({
			message: USER_MESSAGE.SELF_TWO_FACTOR_RESET,
		});
	}

	const row = yield* userRepo.twoFactorReset(input.id);

	if (row === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_TWO_FACTOR_RESET,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: row.id,
		metadata: activityDetails({ [ACTIVITY_DETAIL.EMAIL]: row.email }),
	});
	yield* notifier.twoFactorReset(row);

	return toUserDto(row);
});
