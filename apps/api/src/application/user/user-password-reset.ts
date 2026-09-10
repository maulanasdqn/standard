import { ACTIVITY_ACTION, ACTIVITY_ENTITY_TYPE } from "@app/activity";
import { USER_MESSAGE } from "@app/messages";
import type { TUserPasswordResetInput } from "@app/schemas";
import { Effect } from "effect";
import {
	type EAuth,
	type EDatabase,
	EForbidden,
	ENotFound,
} from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

export const userPasswordReset = Effect.fn("userPasswordReset")(function* (
	input: TUserPasswordResetInput,
	actorId: string,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EForbidden | EDatabase | EAuth,
	UserRepo | ActivityRepo
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRepo;

	if (input.id === actorId) {
		return yield* new EForbidden({ message: USER_MESSAGE.SELF_PASSWORD_RESET });
	}

	const existing = yield* userRepo.findById(input.id);

	if (existing === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	yield* userRepo.resetPassword(input);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_PASSWORD_RESET,
		entityType: ACTIVITY_ENTITY_TYPE.USER,
		entityId: input.id,
	});

	return { id: input.id };
});
