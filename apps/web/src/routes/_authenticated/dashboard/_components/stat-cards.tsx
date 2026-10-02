import { Guard } from "@app/components/guard/guard";
import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { CardSkeleton } from "@app/components/skeleton/card-grid-skeleton";
import { A } from "@mobily/ts-belt";
import { Suspense, type FC, type ReactElement } from "react";
import { DASHBOARD_STATS } from "#/routes/_authenticated/dashboard/_constants/widgets.ts";

export const StatCards: FC = (): ReactElement => (
	<Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{A.map(DASHBOARD_STATS, (stat) => (
			<Guard key={stat.id} permissions={stat.permissions}>
				<StaggerItem>
					<Suspense fallback={<CardSkeleton />}>
						<stat.component />
					</Suspense>
				</StaggerItem>
			</Guard>
		))}
	</Stagger>
);
