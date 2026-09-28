import {
	CardGridSkeleton,
	CardSkeleton,
} from "@app/components/skeleton/card-grid-skeleton";
import { PageHeaderSkeleton } from "@app/components/skeleton/page-header-skeleton";
import type { FC, ReactElement } from "react";
import { RouteSkeleton } from "#/routes/_components/route-skeleton.tsx";

const DASHBOARD_STAT_COUNT = 3;

export const DashboardSkeleton: FC = (): ReactElement => (
	<RouteSkeleton>
		<PageHeaderSkeleton />
		<CardGridSkeleton count={DASHBOARD_STAT_COUNT} />
		<div className="grid gap-4 lg:grid-cols-3">
			<CardSkeleton className="h-[240px] lg:col-span-2" />
			<div className="flex flex-col gap-4">
				<CardSkeleton className="h-36" />
				<CardSkeleton className="h-24" />
			</div>
		</div>
	</RouteSkeleton>
);
