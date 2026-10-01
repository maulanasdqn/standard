import type { TActivityListInput, TActivitySort } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import {
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { orpc } from "#/libs/orpc/client.ts";
import type { TClientErrors, TClientOutputs } from "#/libs/orpc/types.ts";
import { withInstantRange } from "#/libs/table/day-range.ts";
import type { TListChange } from "#/libs/table/list-patch.ts";

type TActivityOut = TClientOutputs["activity"];
type TActivityErr = TClientErrors["activity"];

const routeApi = getRouteApi("/_authenticated/activity/");

export const activityListOptions = (
	input: TActivityListInput,
): UseSuspenseQueryOptions<TActivityOut["list"], TActivityErr["list"]> =>
	orpc.activity.list.queryOptions({
		input,
		queryKey: orpc.activity.list.queryKey({ input }),
	});

export const useActivityList = (): UseSuspenseQueryResult<
	TActivityOut["list"],
	TActivityErr["list"]
> =>
	useSuspenseQuery(activityListOptions(withInstantRange(routeApi.useSearch())));

export const useActivityListChange = (): TListChange<TActivitySort> => {
	const navigate = routeApi.useNavigate();
	return (patch): void => {
		void navigate({ search: (prev) => D.merge(prev, patch) });
	};
};
