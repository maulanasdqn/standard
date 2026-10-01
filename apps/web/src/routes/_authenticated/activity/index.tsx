import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { ACTIVITY_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { activityListSearchSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { withInstantRange } from "#/libs/table/day-range.ts";
import { searchLenient } from "#/libs/table/search-lenient.ts";
import { ActivityTable } from "#/routes/_authenticated/activity/_components/activity-table.tsx";
import {
	activityListOptions,
	useActivityList,
	useActivityListChange,
} from "#/routes/_authenticated/activity/_hooks/use-activity.ts";
import { ListPageSkeleton } from "#/routes/_components/list-page-skeleton.tsx";

const activitySearchValidate = searchLenient(activityListSearchSchema);

const ActivityPage: FC = (): ReactElement => {
	const { data } = useActivityList();
	const search = Route.useSearch();
	const onChange = useActivityListChange();

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-xl font-semibold">{ACTIVITY_MESSAGE.TITLE}</h1>
			<ActivityTable
				list={data}
				sortBy={search.sortBy}
				sortDir={search.sortDir}
				onChange={onChange}
			/>
		</div>
	);
};

const ActivityPending: FC = (): ReactElement => (
	<ListPageSkeleton columns={5} />
);

export const Route = createFileRoute("/_authenticated/activity/")({
	validateSearch: activitySearchValidate,
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.ACTIVITY_READ],
	}),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(
			activityListOptions(withInstantRange(deps.search)),
		),
	component: ActivityPage,
	pendingComponent: ActivityPending,
});
