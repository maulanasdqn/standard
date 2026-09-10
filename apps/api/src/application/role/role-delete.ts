import { ROLE_MESSAGE } from "@app/messages";
import { isRole } from "@app/permissions";
import type { TRoleKeyInput } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { Effect } from "effect";
import {
	ACTIVITY_ACTION,
	ACTIVITY_ENTITY_TYPE,
} from "#/application/shared/activity.ts";
import {
	EBadRequest,
	EConflict,
	type EDatabase,
	ENotFound,
} from "#/application/shared/errors.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { CustomRoleRepo } from "#/infrastructure/db/repositories/custom-role-repository.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

export const roleDelete = Effect.fn("roleDelete")(function* (
	{ key }: TRoleKeyInput,
	actorId: string,
): Effect.fn.Return<
	{ key: string },
	ENotFound | EBadRequest | EConflict | EDatabase,
	CustomRoleRepo | UserRepo | ActivityRepo
> {
	const customRoleRepo = yield* CustomRoleRepo;
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRepo;

	if (isRole(key)) {
		return yield* new EBadRequest({ message: ROLE_MESSAGE.FIXED });
	}

	const counts = yield* userRepo.countByRole();

	if ((D.get(counts, key) ?? 0) > 0) {
		return yield* new EConflict({ message: ROLE_MESSAGE.IN_USE });
	}

	const removed = yield* customRoleRepo.remove(key);

	if (!removed) {
		return yield* new ENotFound({ message: ROLE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.ROLE_DELETE,
		entityType: ACTIVITY_ENTITY_TYPE.ROLE,
		entityId: key,
	});

	return { key };
});
