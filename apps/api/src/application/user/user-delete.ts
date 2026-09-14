import { USER_MESSAGE } from "@app/messages";
import type { TUserIdInput } from "@app/schemas";
import { Effect } from "effect";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import {
	type EDatabase,
	EForbidden,
	ENotFound,
} from "#/domain/shared/errors.ts";
import { ActivityRepo } from "#/domain/activity/activity.ts";
import { UserRepo } from "#/domain/user/user.ts";

export const userDelete = Effect.fn("userDelete")(function* (
	{ id }: TUserIdInput,
	actorId: string,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EForbidden | EDatabase,
	UserRepo | ActivityRepo
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRepo;

	if (id === actorId) {
		return yield* new EForbidden({ message: USER_MESSAGE.SELF_DELETE });
	}

	const removed = yield* userRepo.remove(id);

	if (!removed) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_DELETE,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: id,
	});

	return { id };
});
