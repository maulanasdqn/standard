import type { TRoleDto } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import {
	ROLE_MEMBERS_FILTER,
	ROLE_TYPE_FILTER,
} from "#/routes/_authenticated/roles/_constants/role-filter.ts";
import {
	roleMembersFilterOf,
	roleTypeFilterOf,
	rolesFiltered,
} from "#/routes/_authenticated/roles/_utils/role-filter.ts";

const role = (key: string, fixed: boolean, memberCount: number): TRoleDto => ({
	key,
	label: key,
	description: null,
	fixed,
	permissions: [],
	memberCount,
});

const roles = [
	role("admin", true, 2),
	role("viewer", true, 0),
	role("editor", false, 1),
];

describe("rolesFiltered", () => {
	it("keeps every role when no filter is set", (): void => {
		expect(rolesFiltered(roles, {})).toHaveLength(3);
	});

	it("narrows by type and by members together", (): void => {
		const keys = A.map(
			rolesFiltered(roles, {
				type: ROLE_TYPE_FILTER.FIXED,
				members: ROLE_MEMBERS_FILTER.WITHOUT,
			}),
			(found) => found.key,
		);

		expect(keys).toEqual(["viewer"]);
	});

	it("reads only known filter values", (): void => {
		expect(roleTypeFilterOf(ROLE_TYPE_FILTER.CUSTOM)).toBe(
			ROLE_TYPE_FILTER.CUSTOM,
		);
		expect(roleTypeFilterOf("other")).toBe(undefined);
		expect(roleMembersFilterOf(ROLE_MEMBERS_FILTER.WITH)).toBe(
			ROLE_MEMBERS_FILTER.WITH,
		);
		expect(roleMembersFilterOf(undefined)).toBe(undefined);
	});
});
