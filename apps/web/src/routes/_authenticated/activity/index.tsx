import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { activityListInputSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { ListPagination } from "#/routes/_authenticated/_components/list-pagination.tsx";
import { ActivityFilters } from "#/routes/_authenticated/activity/_components/activity-filters.tsx";
import { ActivityTable } from "#/routes/_authenticated/activity/_components/activity-table.tsx";
import {
	useActivityList,
	useActivityPageChange,
} from "#/routes/_authenticated/activity/_hooks/use-activity.ts";

export const Route = createFileRoute("/_authenticated/activity/")({
	validateSearch: activityListInputSchema,
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.ACTIVITY_READ],
	}),
	component: ActivityPage,
});

function ActivityPage(): ReactElement {
	const { data, isLoading } = useActivityList();
	const goToPage = useActivityPageChange();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<h1 className="text-xl font-semibold">Activity</h1>
			<ActivityFilters />
			{isLoading ? (
				<p className="text-sm text-neutral-500">Loading…</p>
			) : (
				<ActivityTable entries={data?.items ?? []} />
			)}
			{data ? (
				<ListPagination
					pageInfo={data}
					noun="entries"
					onPageChange={goToPage}
				/>
			) : null}
		</div>
	);
}
