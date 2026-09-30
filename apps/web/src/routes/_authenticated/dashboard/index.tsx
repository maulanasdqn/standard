import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { DASHBOARD_MESSAGE } from "@app/messages";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { DashboardSkeleton } from "#/routes/_authenticated/dashboard/_components/dashboard-skeleton.tsx";
import { ActivitySection } from "#/routes/_authenticated/dashboard/_components/activity-section.tsx";
import { HealthCard } from "#/routes/_authenticated/dashboard/_components/health-card.tsx";
import { QuickActions } from "#/routes/_authenticated/dashboard/_components/quick-actions.tsx";
import { StatCards } from "#/routes/_authenticated/dashboard/_components/stat-cards.tsx";
import { useDashboardHealth } from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";

const DashboardPage: FC = (): ReactElement => {
	const health = useDashboardHealth();

	return (
		<Stagger className="flex flex-col gap-6">
			<StaggerItem>
				<h1 className="text-xl font-semibold">{DASHBOARD_MESSAGE.TITLE}</h1>
			</StaggerItem>
			<StaggerItem>
				<StatCards />
			</StaggerItem>
			<StaggerItem className="grid gap-4 lg:grid-cols-3">
				<ActivitySection />
				<Stagger className="flex flex-col gap-4">
					<StaggerItem>
						<HealthCard health={health} />
					</StaggerItem>
					<StaggerItem>
						<QuickActions />
					</StaggerItem>
				</Stagger>
			</StaggerItem>
		</Stagger>
	);
};

export const Route = createFileRoute("/_authenticated/dashboard/")({
	component: DashboardPage,
	pendingComponent: DashboardSkeleton,
});
