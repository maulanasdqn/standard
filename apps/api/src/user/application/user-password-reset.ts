import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetails,
} from "@app/activity";
import { USER_MESSAGE } from "@app/messages";
import type { TUserPasswordResetInput } from "@app/schemas";
import { Effect } from "effect";
import {
	type EAuth,
	type EDatabase,
	EForbidden,
	type ENotFound,
} from "#/shared/errors.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { UserRepo, type TUserRepoId } from "#/user/domain/user.ts";
import type { TActorAuthority } from "#/shared/session.ts";
import { userTargetEnsure } from "#/user/application/user-target-ensure.ts";
import type { TCustomRoleRepoId } from "#/role/index.ts";

export const userPasswordReset = Effect.fn("userPasswordReset")(function* (
	input: TUserPasswordResetInput,
	actorId: string,
	authority: TActorAuthority,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EForbidden | EDatabase | EAuth,
	TUserRepoId | TActivityRecorderId | TCustomRoleRepoId
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRecorder;

	if (input.id === actorId) {
		return yield* new EForbidden({ message: USER_MESSAGE.SELF_PASSWORD_RESET });
	}

	const existing = yield* userTargetEnsure(input.id, authority);

	yield* userRepo.resetPassword(input);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_PASSWORD_RESET,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: input.id,
		metadata: activityDetails({
			[ACTIVITY_DETAIL.EMAIL]: existing.email,
		}),
	});

	return { id: input.id };
});
