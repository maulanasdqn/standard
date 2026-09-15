import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { ACTIVITY_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { activityListInputSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { ListPagination } from "#/routes/_authenticated/_components/list-pagination.tsx";
import { ActivityFilters } from "#/routes/_authenticated/activity/_components/activity-filters.tsx";
import { ActivityTable } from "#/routes/_authenticated/activity/_components/activity-table.tsx";
import {
	activityListOptions,
	useActivityList,
	useActivityPageChange,
} from "#/routes/_authenticated/activity/_hooks/use-activity.ts";

const ActivityPage: FC = (): ReactElement => {
	const { data } = useActivityList();
	const goToPage = useActivityPageChange();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<h1 className="text-xl font-semibold">{ACTIVITY_MESSAGE.TITLE}</h1>
			<ActivityFilters />
			<ActivityTable entries={data.items} />
			<ListPagination
				pageInfo={data}
				noun={ACTIVITY_MESSAGE.PAGINATION_NOUN}
				onPageChange={goToPage}
			/>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/activity/")({
	validateSearch: activityListInputSchema,
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.ACTIVITY_READ],
	}),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(activityListOptions(deps.search)),
	component: ActivityPage,
});
