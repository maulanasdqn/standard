import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { USER_MESSAGE } from "@app/messages";
import type { TUserIdInput } from "@app/schemas";
import { Effect } from "effect";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";
import { UserRepo, type TUserRepoId } from "#/user/domain/user.ts";

export const userSessionsRevoke = Effect.fn("userSessionsRevoke")(function* (
	input: TUserIdInput,
	actorId: string,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EDatabase,
	TUserRepoId | TActivityRecorderId
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRecorder;

	const existing = yield* userRepo.findById(input.id);

	if (existing === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	yield* userRepo.sessionsRevoke(input.id);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.SESSION_REVOKE,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: input.id,
	});

	return { id: input.id };
});
