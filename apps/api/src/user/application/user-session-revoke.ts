import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { USER_MESSAGE } from "@app/messages";
import type { TUserSessionRevokeInput } from "@app/schemas";
import { Effect } from "effect";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";
import { UserRepo, type TUserRepoId } from "#/user/domain/user.ts";
import type { TActorAuthority } from "#/shared/session.ts";
import { userTargetEnsure } from "#/user/application/user-target-ensure.ts";
import type { TCustomRoleRepoId } from "#/role/index.ts";
import type { EForbidden } from "#/shared/errors.ts";

export const userSessionRevoke = Effect.fn("userSessionRevoke")(function* (
	input: TUserSessionRevokeInput,
	actorId: string,
	authority: TActorAuthority,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EForbidden | EDatabase,
	TUserRepoId | TActivityRecorderId | TCustomRoleRepoId
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRecorder;

	yield* userTargetEnsure(input.id, authority);

	const removed = yield* userRepo.sessionRevoke(input.id, input.sessionId);

	if (!removed) {
		return yield* new ENotFound({ message: USER_MESSAGE.SESSION_NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.SESSION_REVOKE,
		resourceType: ACTIVITY_RESOURCE_TYPE.SESSION,
		resourceId: input.sessionId,
	});

	return { id: input.sessionId };
});
