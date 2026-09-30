import type { TNoteListSearch } from "@app/schemas";
import { A, D } from "@mobily/ts-belt";
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";

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

export type TNoteFilters = {
	draft: TNoteFilterValues;
	activeCount: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDraftChange: (patch: Partial<TNoteFilterValues>) => void;
	onApply: () => void;
	onReset: () => void;
	onClear: () => void;
};

const blankToUndefined = (value: string | undefined): string | undefined =>
	value === "" ? undefined : value;

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

const countActive = (values: TNoteFilterValues): number =>
	A.length(
		A.filter(
			[values.title, values.dateFrom ?? values.dateTo, values.attachments],
			(value) => value !== undefined,
		),
	);

export const useNoteFilters = (): TNoteFilters => {
	const navigate = listRouteApi.useNavigate();
	const search = listRouteApi.useSearch();
	const applied = normalize(D.selectKeys(search, D.keys(EMPTY)));
	const [draft, setDraft] = useState<TNoteFilterValues>(applied);
	const [open, setOpen] = useState(false);

	const commit = (values: TNoteFilterValues): void =>
		void navigate({
			search: (prev) =>
				D.merge(D.merge(prev, EMPTY), D.merge(values, { page: 1 })),
		});

	return {
		draft,
		activeCount: countActive(applied),
		open,
		onOpenChange: (next: boolean): void => {
			setDraft(applied);
			setOpen(next);
		},
		onDraftChange: (patch: Partial<TNoteFilterValues>): void =>
			setDraft((current) => D.merge(current, patch)),
		onApply: (): void => {
			commit(normalize(draft));
			setOpen(false);
		},
		onReset: (): void => setDraft(EMPTY),
		onClear: (): void => commit(EMPTY),
	};
};
