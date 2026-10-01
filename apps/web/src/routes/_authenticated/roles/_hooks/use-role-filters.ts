import { ROLE_MESSAGE } from "@app/messages";
import { D } from "@mobily/ts-belt";
import { getRouteApi } from "@tanstack/react-router";
import type { TFilterOption } from "#/routes/_authenticated/_components/filter-select.tsx";
import {
	definedCount,
	type TFilterPanel,
	useFilterPanel,
} from "#/routes/_authenticated/_hooks/use-filter-panel.ts";
import {
	ROLE_MEMBERS_FILTER,
	ROLE_TYPE_FILTER,
	type TRoleListSearch,
} from "#/routes/_authenticated/roles/_constants/role-filter.ts";

const listRouteApi = getRouteApi("/_authenticated/roles/");

const EMPTY: TRoleListSearch = { type: undefined, members: undefined };

export const ROLE_TYPE_OPTIONS: readonly TFilterOption[] = [
	{ value: ROLE_TYPE_FILTER.FIXED, label: ROLE_MESSAGE.FILTER_TYPE_FIXED },
	{ value: ROLE_TYPE_FILTER.CUSTOM, label: ROLE_MESSAGE.FILTER_TYPE_CUSTOM },
];

export const ROLE_MEMBERS_OPTIONS: readonly TFilterOption[] = [
	{ value: ROLE_MEMBERS_FILTER.WITH, label: ROLE_MESSAGE.FILTER_MEMBERS_WITH },
	{
		value: ROLE_MEMBERS_FILTER.WITHOUT,
		label: ROLE_MESSAGE.FILTER_MEMBERS_WITHOUT,
	},
];

const normalize = (values: TRoleListSearch): TRoleListSearch => ({
	type: values.type,
	members: values.members,
});

const count = (values: TRoleListSearch): number =>
	definedCount([values.type, values.members]);

export const useRoleFilters = (): TFilterPanel<TRoleListSearch> => {
	const navigate = listRouteApi.useNavigate();
	const search = listRouteApi.useSearch();

	return useFilterPanel({
		applied: normalize(D.selectKeys(search, D.keys(EMPTY))),
		empty: EMPTY,
		normalize,
		count,
		commit: (values): void =>
			void navigate({ search: (prev) => ({ ...prev, ...EMPTY, ...values }) }),
	});
};
