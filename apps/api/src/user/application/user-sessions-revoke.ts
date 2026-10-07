import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { TUserIdInput } from "@app/schemas";
import { Effect } from "effect";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { EDatabase, EForbidden, ENotFound } from "#/shared/errors.ts";
import { UserRepo, type TUserRepoId } from "#/user/domain/user.ts";
import type { TActorAuthority } from "#/shared/session.ts";
import { userTargetEnsure } from "#/user/application/user-target-ensure.ts";
import type { TCustomRoleRepoId } from "#/role/index.ts";

export const userSessionsRevoke = Effect.fn("userSessionsRevoke")(function* (
	input: TUserIdInput,
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

	yield* userRepo.sessionsRevoke(input.id);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.SESSION_REVOKE,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: input.id,
	});

	return { id: input.id };
});
