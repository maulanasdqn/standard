import type { TNoteListSearch } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { getRouteApi } from "@tanstack/react-router";
import {
	blankToUndefined,
	definedCount,
	type TFilterPanel,
	useFilterPanel,
} from "#/routes/_authenticated/_hooks/use-filter-panel.ts";

const listRouteApi = getRouteApi("/_authenticated/notes/");

export type TNoteFilterValues = Pick<
	TNoteListSearch,
	"title" | "dateField" | "dateFrom" | "dateTo" | "attachments"
>;

const EMPTY: TNoteFilterValues = {
	title: undefined,
	dateField: undefined,
	dateFrom: undefined,
	dateTo: undefined,
	attachments: undefined,
};

const normalize = (values: TNoteFilterValues): TNoteFilterValues => {
	const dateFrom = blankToUndefined(values.dateFrom);
	const dateTo = blankToUndefined(values.dateTo);
	const hasDate = dateFrom !== undefined || dateTo !== undefined;
	return {
		title: blankToUndefined(values.title?.trim()),
		dateField: hasDate ? values.dateField : undefined,
		dateFrom,
		dateTo,
		attachments: values.attachments,
	};
};

const count = (values: TNoteFilterValues): number =>
	definedCount([
		values.title,
		values.dateFrom ?? values.dateTo,
		values.attachments,
	]);

export const useNoteFilters = (): TFilterPanel<TNoteFilterValues> => {
	const navigate = listRouteApi.useNavigate();
	const search = listRouteApi.useSearch();

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
