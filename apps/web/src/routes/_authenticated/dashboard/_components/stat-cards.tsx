import { Guard } from "@app/components/guard/guard";
import { CardSkeleton } from "@app/components/skeleton/card-grid-skeleton";
import { DASHBOARD_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { Shield, StickyNote, Users } from "lucide-react";
import { Suspense, type FC, type ReactElement } from "react";
import {
	useDashboardNotes,
	useDashboardRoles,
	useDashboardUsers,
} from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";
import { StatCard } from "#/routes/_authenticated/dashboard/_components/stat-card.tsx";

const UserStat: FC = (): ReactElement => {
	const { total } = useDashboardUsers();
	return (
		<StatCard
			title={DASHBOARD_MESSAGE.TOTAL_USERS}
			value={total}
			icon={Users}
			to="/users"
		/>
	);
};

const RoleStat: FC = (): ReactElement => {
	const { total } = useDashboardRoles();
	return (
		<StatCard
			title={DASHBOARD_MESSAGE.TOTAL_ROLES}
			value={total}
			icon={Shield}
			to="/roles"
		/>
	);
};

const NoteStat: FC = (): ReactElement => {
	const { total } = useDashboardNotes();
	return (
		<StatCard
			title={DASHBOARD_MESSAGE.TOTAL_NOTES}
			value={total}
			icon={StickyNote}
			to="/notes"
		/>
	);
};

export const StatCards: FC = (): ReactElement => (
	<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Guard permissions={[PERMISSION.NOTE_READ]}>
			<Suspense fallback={<CardSkeleton />}>
				<NoteStat />
			</Suspense>
		</Guard>
		<Guard permissions={[PERMISSION.USER_READ]}>
			<Suspense fallback={<CardSkeleton />}>
				<UserStat />
			</Suspense>
		</Guard>
		<Guard permissions={[PERMISSION.ROLE_READ]}>
			<Suspense fallback={<CardSkeleton />}>
				<RoleStat />
			</Suspense>
		</Guard>
	</div>
);
