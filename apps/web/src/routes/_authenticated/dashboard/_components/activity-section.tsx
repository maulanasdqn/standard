import { Guard } from "@app/components/guard/guard";
import { CardSkeleton } from "@app/components/skeleton/card-grid-skeleton";
import { PERMISSION } from "@app/permissions";
import { Suspense, type FC, type ReactElement } from "react";
import { useDashboardActivity } from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";
import { RecentActivity } from "#/routes/_authenticated/dashboard/_components/recent-activity.tsx";

const ActivityContent: FC = (): ReactElement => {
	const data = useDashboardActivity();
	return <RecentActivity entries={data.items} />;
};

const ActivitySkeleton: FC = (): ReactElement => (
	<CardSkeleton className="col-span-full h-[240px] lg:col-span-2" />
);

export const ActivitySection: FC = (): ReactElement => (
	<Guard permissions={[PERMISSION.ACTIVITY_READ]}>
		<Suspense fallback={<ActivitySkeleton />}>
			<ActivityContent />
		</Suspense>
	</Guard>
);
