import { USER_MESSAGE } from "@app/messages";
import type { TUserIdInput } from "@app/schemas";
import { Effect } from "effect";
import { ACTIVITY_ACTION, ACTIVITY_ENTITY_TYPE } from "@app/activity";
import {
	type EDatabase,
	EForbidden,
	ENotFound,
} from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

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
		entityType: ACTIVITY_ENTITY_TYPE.USER,
		entityId: id,
	});

	return { id };
});
