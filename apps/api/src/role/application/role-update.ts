import { ROLE_MESSAGE } from "@app/messages";
import { isRole, type TPermission } from "@app/permissions";
import type { TRoleDto, TRoleUpdateInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toRoleDto } from "#/role/application/to-role-dto.ts";
import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetailList,
	activityDetailPrevious,
	activityDetails,
	type TActivityDetails,
} from "@app/activity";
import {
	EBadRequest,
	type EDatabase,
	EForbidden,
	ENotFound,
} from "#/shared/errors.ts";
import type { TActorAuthority } from "#/shared/session.ts";
import { permissionsWithin } from "#/role/application/role-authority.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	CustomRoleRepo,
	type TCustomRoleRepoId,
	type TCustomRoleRow,
} from "#/role/domain/custom-role.ts";

const permissionsMissingFrom = (
	source: readonly TPermission[],
	other: readonly TPermission[],
): readonly TPermission[] =>
	A.reject(source, (permission): boolean => A.includes(other, permission));

const updateDetails = (
	previous: TCustomRoleRow,
	next: TCustomRoleRow,
): TActivityDetails =>
	activityDetails({
		[ACTIVITY_DETAIL.LABEL]: next.label,
		[ACTIVITY_DETAIL.PREVIOUS_LABEL]: activityDetailPrevious(
			previous.label,
			next.label,
		),
		[ACTIVITY_DETAIL.PERMISSIONS_ADDED]: activityDetailList(
			permissionsMissingFrom(next.permissions, previous.permissions),
		),
		[ACTIVITY_DETAIL.PERMISSIONS_REMOVED]: activityDetailList(
			permissionsMissingFrom(previous.permissions, next.permissions),
		),
	});

export const roleUpdate = Effect.fn("roleUpdate")(function* (
	input: TRoleUpdateInput,
	actorId: string,
	authority: TActorAuthority,
): Effect.fn.Return<
	TRoleDto,
	ENotFound | EBadRequest | EForbidden | EDatabase,
	TCustomRoleRepoId | TActivityRecorderId
> {
	const customRoleRepo = yield* CustomRoleRepo;
	const activityRepo = yield* ActivityRecorder;

	if (isRole(input.key)) {
		return yield* new EBadRequest({ message: ROLE_MESSAGE.FIXED });
	}

	if (input.key === authority.role) {
		return yield* new EForbidden({ message: ROLE_MESSAGE.OWN_ROLE });
	}

	const previous = yield* customRoleRepo.findByKey(input.key);

	if (previous === null) {
		return yield* new ENotFound({ message: ROLE_MESSAGE.NOT_FOUND });
	}

	const granting = [...previous.permissions, ...(input.permissions ?? [])];

	if (!permissionsWithin(authority, granting)) {
		return yield* new EForbidden({
			message: ROLE_MESSAGE.PERMISSIONS_BEYOND_ACTOR,
		});
	}

	const updated = yield* customRoleRepo.update(input);

	if (updated === null) {
		return yield* new ENotFound({ message: ROLE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.ROLE_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.ROLE,
		resourceId: updated.key,
		metadata: updateDetails(previous, updated),
	});

	const counts = yield* customRoleRepo.memberCounts();
	return toRoleDto(updated, counts);
});
