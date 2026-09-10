import { D } from "@mobily/ts-belt";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { match } from "ts-pattern";
import { orpc } from "#/libs/orpc/client.ts";
import type { TClientErrors, TClientOutputs } from "#/libs/orpc/types.ts";

type TActivityOut = TClientOutputs["activity"];
type TActivityErr = TClientErrors["activity"];

export type TActivityFilters = {
	action: string;
	entityType: string;
	onActionChange: (next: string) => void;
	onEntityTypeChange: (next: string) => void;
};

const routeApi = getRouteApi("/_authenticated/activity/");

const emptyToUndefined = (value: string): string | undefined =>
	match(value)
		.with("", () => undefined)
		.otherwise((text) => text);

export const useActivityList = (): UseQueryResult<
	TActivityOut["list"],
	TActivityErr["list"]
> => {
	const search = routeApi.useSearch();

	return useQuery(
		orpc.activity.list.queryOptions({
			input: search,
			queryKey: orpc.activity.list.queryKey({ input: search }),
		}),
	);
};

export const useActivityPageChange = (): ((page: number) => void) => {
	const navigate = routeApi.useNavigate();
	return (page: number): void => {
		void navigate({ search: (prev) => D.merge(prev, { page }) });
	};
};

export const useActivityFilters = (): TActivityFilters => {
	const navigate = routeApi.useNavigate();
	const { action, entityType } = routeApi.useSearch();

	return {
		action: action ?? "",
		entityType: entityType ?? "",
		onActionChange: (next: string): void => {
			void navigate({
				search: (prev) =>
					D.merge(prev, { action: emptyToUndefined(next), page: 1 }),
			});
		},
		onEntityTypeChange: (next: string): void => {
			void navigate({
				search: (prev) =>
					D.merge(prev, { entityType: emptyToUndefined(next), page: 1 }),
			});
		},
	};
};
