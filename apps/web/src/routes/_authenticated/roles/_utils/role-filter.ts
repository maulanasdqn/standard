import type { TRoleDto } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { match } from "ts-pattern";
import {
	ROLE_MEMBERS_FILTER,
	ROLE_TYPE_FILTER,
	type TRoleListSearch,
	type TRoleMembersFilter,
	type TRoleTypeFilter,
} from "#/routes/_authenticated/roles/_constants/role-filter.ts";

const typeMatches = (
	role: TRoleDto,
	type: TRoleTypeFilter | undefined,
): boolean =>
	match(type)
		.with(ROLE_TYPE_FILTER.FIXED, () => role.fixed)
		.with(ROLE_TYPE_FILTER.CUSTOM, () => !role.fixed)
		.with(undefined, () => true)
		.exhaustive();

const membersMatch = (
	role: TRoleDto,
	members: TRoleMembersFilter | undefined,
): boolean =>
	match(members)
		.with(ROLE_MEMBERS_FILTER.WITH, () => role.memberCount > 0)
		.with(ROLE_MEMBERS_FILTER.WITHOUT, () => role.memberCount === 0)
		.with(undefined, () => true)
		.exhaustive();

export const rolesFiltered = (
	roles: readonly TRoleDto[],
	search: TRoleListSearch,
): readonly TRoleDto[] =>
	A.filter(
		roles,
		(role) =>
			typeMatches(role, search.type) && membersMatch(role, search.members),
	);

export const roleTypeFilterOf = (
	value: string | undefined,
): TRoleTypeFilter | undefined =>
	match(value)
		.with(
			ROLE_TYPE_FILTER.FIXED,
			ROLE_TYPE_FILTER.CUSTOM,
			(found): TRoleTypeFilter => found,
		)
		.otherwise((): undefined => undefined);

export const roleMembersFilterOf = (
	value: string | undefined,
): TRoleMembersFilter | undefined =>
	match(value)
		.with(
			ROLE_MEMBERS_FILTER.WITH,
			ROLE_MEMBERS_FILTER.WITHOUT,
			(found): TRoleMembersFilter => found,
		)
		.otherwise((): undefined => undefined);
