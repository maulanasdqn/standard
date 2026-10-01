import { USER_MESSAGE } from "@app/messages";
import {
	type TUserListSearch,
	type TUserStatus,
	type TUserTwoFactorFilter,
	USER_STATUS,
	USER_TWO_FACTOR_FILTER,
	userListSearchSchema,
} from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { getRouteApi } from "@tanstack/react-router";
import { match } from "ts-pattern";
import type { TFilterOption } from "#/routes/_authenticated/_components/filter-select.tsx";
import {
	blankToUndefined,
	definedCount,
	type TFilterPanel,
	useFilterPanel,
} from "#/routes/_authenticated/_hooks/use-filter-panel.ts";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";

const listRouteApi = getRouteApi("/_authenticated/users/");

export type TUserFilterValues = Pick<
	TUserListSearch,
	"role" | "status" | "twoFactor" | "dateFrom" | "dateTo"
>;

const EMPTY: TUserFilterValues = {
	role: undefined,
	status: undefined,
	twoFactor: undefined,
	dateFrom: undefined,
	dateTo: undefined,
};

export const USER_STATUS_OPTIONS: readonly TFilterOption[] = [
	{ value: USER_STATUS.ACTIVE, label: USER_MESSAGE.STATUS_ACTIVE },
	{ value: USER_STATUS.PENDING, label: USER_MESSAGE.STATUS_PENDING },
	{ value: USER_STATUS.DEACTIVATED, label: USER_MESSAGE.STATUS_DEACTIVATED },
];

export const USER_TWO_FACTOR_OPTIONS: readonly TFilterOption[] = [
	{ value: USER_TWO_FACTOR_FILTER.ON, label: USER_MESSAGE.TWO_FACTOR_ON },
	{ value: USER_TWO_FACTOR_FILTER.OFF, label: USER_MESSAGE.TWO_FACTOR_OFF },
];

export const userStatusFilterOf = (
	value: string | undefined,
): TUserStatus | undefined =>
	match(value)
		.with(
			USER_STATUS.ACTIVE,
			USER_STATUS.PENDING,
			USER_STATUS.DEACTIVATED,
			(found): TUserStatus => found,
		)
		.otherwise((): undefined => undefined);

export const userTwoFactorFilterOf = (
	value: string | undefined,
): TUserTwoFactorFilter | undefined =>
	match(value)
		.with(
			USER_TWO_FACTOR_FILTER.ON,
			USER_TWO_FACTOR_FILTER.OFF,
			(found): TUserTwoFactorFilter => found,
		)
		.otherwise((): undefined => undefined);

const filterValuesSchema = userListSearchSchema.pick({
	role: true,
	status: true,
	twoFactor: true,
	dateFrom: true,
	dateTo: true,
});

const normalize = (values: TUserFilterValues): TUserFilterValues => ({
	...EMPTY,
	...filterValuesSchema.parse({
		...values,
		dateFrom: blankToUndefined(values.dateFrom),
		dateTo: blankToUndefined(values.dateTo),
	}),
});

const count = (values: TUserFilterValues): number =>
	definedCount([
		values.role,
		values.status,
		values.twoFactor,
		values.dateFrom ?? values.dateTo,
	]);

export type TUserFilters = TFilterPanel<TUserFilterValues> & {
	roleOptions: readonly TFilterOption[];
};

export const useUserFilters = (): TUserFilters => {
	const navigate = listRouteApi.useNavigate();
	const search = listRouteApi.useSearch();
	const roleOptions = useRoleOptions();

	const panel = useFilterPanel({
		applied: normalize(D.selectKeys(search, D.keys(EMPTY))),
		empty: EMPTY,
		normalize,
		count,
		commit: (values): void =>
			void navigate({
				search: (prev) => ({ ...prev, ...EMPTY, ...values, page: 1 }),
			}),
	});

	return { ...panel, roleOptions };
};
