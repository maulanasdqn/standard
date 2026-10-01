import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ACTIVITY_ACTION_LABEL, ACTIVITY_ENTITY_LABEL } from "@app/messages";
import type { TActivityListSearch } from "@app/schemas";
import { A, D } from "@mobily/ts-belt";
import { getRouteApi } from "@tanstack/react-router";
import type { TFilterOption } from "#/routes/_authenticated/_components/filter-select.tsx";
import {
	blankToUndefined,
	definedCount,
	type TFilterPanel,
	useFilterPanel,
} from "#/routes/_authenticated/_hooks/use-filter-panel.ts";

const routeApi = getRouteApi("/_authenticated/activity/");

export type TActivityFilterValues = Pick<
	TActivityListSearch,
	"action" | "resourceType" | "dateFrom" | "dateTo"
>;

const EMPTY: TActivityFilterValues = {
	action: undefined,
	resourceType: undefined,
	dateFrom: undefined,
	dateTo: undefined,
};

export const ACTIVITY_ACTION_OPTIONS: readonly TFilterOption[] = A.map(
	D.values(ACTIVITY_ACTION),
	(value) => ({ value, label: ACTIVITY_ACTION_LABEL[value] }),
);

export const ACTIVITY_ENTITY_OPTIONS: readonly TFilterOption[] = A.map(
	D.values(ACTIVITY_RESOURCE_TYPE),
	(value) => ({ value, label: ACTIVITY_ENTITY_LABEL[value] }),
);

const normalize = (values: TActivityFilterValues): TActivityFilterValues => ({
	action: values.action,
	resourceType: values.resourceType,
	dateFrom: blankToUndefined(values.dateFrom),
	dateTo: blankToUndefined(values.dateTo),
});

const count = (values: TActivityFilterValues): number =>
	definedCount([
		values.action,
		values.resourceType,
		values.dateFrom ?? values.dateTo,
	]);

export const useActivityFilters = (): TFilterPanel<TActivityFilterValues> => {
	const navigate = routeApi.useNavigate();
	const search = routeApi.useSearch();

	return useFilterPanel({
		applied: normalize(D.selectKeys(search, D.keys(EMPTY))),
		empty: EMPTY,
		normalize,
		count,
		commit: (values): void =>
			void navigate({
				search: (prev) => ({ ...prev, ...EMPTY, ...values, page: 1 }),
			}),
	});
};
