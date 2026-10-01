import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetails,
} from "@app/activity";
import { USER_MESSAGE } from "@app/messages";
import type { TUser, TUserInviteInput } from "@app/schemas";
import { Effect } from "effect";
import { roleEnsure, type TCustomRoleRepoId } from "#/role/index.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	type EAuth,
	type EBadRequest,
	EConflict,
	type EDatabase,
} from "#/shared/errors.ts";
import { toUserDto } from "#/user/application/to-user-dto.ts";
import { UserRepo, type TUserRepoId } from "#/user/domain/user.ts";
import {
	type TUserNotifierId,
	UserNotifier,
} from "#/user/domain/user-notifier.ts";

export const userInvite = Effect.fn("userInvite")(function* (
	input: TUserInviteInput,
	actorId: string,
): Effect.fn.Return<
	TUser,
	EConflict | EBadRequest | EDatabase | EAuth,
	TUserRepoId | TCustomRoleRepoId | TActivityRecorderId | TUserNotifierId
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRecorder;
	const notifier = yield* UserNotifier;

	yield* roleEnsure(input.role);

	const existing = yield* userRepo.findByEmail(input.email);

	if (existing !== null) {
		return yield* new EConflict({ message: USER_MESSAGE.EMAIL_TAKEN });
	}

	const row = yield* userRepo.invite(input);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_INVITE,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: row.id,
		metadata: activityDetails({
			[ACTIVITY_DETAIL.EMAIL]: row.email,
			[ACTIVITY_DETAIL.ROLE]: row.role,
		}),
	});
	yield* notifier.invite(row);

	return toUserDto(row);
});
