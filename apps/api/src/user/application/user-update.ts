import { USER_MESSAGE } from "@app/messages";
import type { TUser, TUserUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import { match, P } from "ts-pattern";
import { roleEnsure } from "#/role/index.ts";
import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetailPrevious,
	activityDetails,
	type TActivityDetails,
} from "@app/activity";
import {
	type EBadRequest,
	type EConflict,
	type EDatabase,
	EForbidden,
	ENotFound,
} from "#/shared/errors.ts";
import { toUserDto } from "#/user/application/to-user-dto.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { TCustomRoleRepoId } from "#/role/index.ts";
import {
	UserRepo,
	type TUserRepoId,
	type TUserRow,
} from "#/user/domain/user.ts";
import {
	type TUserNotifierId,
	UserNotifier,
} from "#/user/domain/user-notifier.ts";
import type { TActorAuthority } from "#/shared/session.ts";
import { userTargetEnsure } from "#/user/application/user-target-ensure.ts";
import { roleWithinEnsure } from "#/role/index.ts";

const changedTo = (previous: string, next: string): string | undefined =>
	previous === next ? undefined : next;

const updateDetails = (previous: TUserRow, next: TUserRow): TActivityDetails =>
	activityDetails({
		[ACTIVITY_DETAIL.ROLE]: changedTo(previous.role, next.role),
		[ACTIVITY_DETAIL.PREVIOUS_ROLE]: activityDetailPrevious(
			previous.role,
			next.role,
		),
		[ACTIVITY_DETAIL.EMAIL]: changedTo(previous.email, next.email),
		[ACTIVITY_DETAIL.PREVIOUS_EMAIL]: activityDetailPrevious(
			previous.email,
			next.email,
		),
		[ACTIVITY_DETAIL.NAME]: changedTo(previous.name, next.name),
		[ACTIVITY_DETAIL.PREVIOUS_NAME]: activityDetailPrevious(
			previous.name,
			next.name,
		),
	});

export const userUpdate = Effect.fn("userUpdate")(function* (
	input: TUserUpdateInput,
	actorId: string,
	authority: TActorAuthority,
): Effect.fn.Return<
	TUser,
	ENotFound | EForbidden | EBadRequest | EConflict | EDatabase,
	TUserRepoId | TCustomRoleRepoId | TActivityRecorderId | TUserNotifierId
> {
	const userRepo = yield* UserRepo;
	const activityRepo = yield* ActivityRecorder;
	const notifier = yield* UserNotifier;

	if (input.email !== undefined && input.id === actorId) {
		return yield* new EForbidden({ message: USER_MESSAGE.SELF_EMAIL_CHANGE });
	}

	if (input.role !== undefined && input.id === actorId) {
		return yield* new EForbidden({ message: USER_MESSAGE.SELF_ROLE_CHANGE });
	}

	yield* match(input.role)
		.with(P.nullish, () => Effect.void)
		.otherwise((role) =>
			roleEnsure(role).pipe(
				Effect.andThen(
					roleWithinEnsure(authority, role, USER_MESSAGE.ROLE_BEYOND_ACTOR),
				),
			),
		);

	const previous = yield* userTargetEnsure(input.id, authority);

	const updated = yield* userRepo.update(input);

	if (updated === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	if (updated.email !== previous.email) {
		yield* userRepo.sessionsRevoke(updated.id);
		yield* notifier.emailVerify(updated);
		yield* notifier.emailChanged(updated, previous.email);
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: updated.id,
		metadata: updateDetails(previous, updated),
	});

	return toUserDto(updated);
});
