import { DASHBOARD_MESSAGE } from "@app/messages";
import { Shield, StickyNote, Users } from "lucide-react";
import type { FC, ReactElement } from "react";
import { StatCard } from "#/routes/_authenticated/dashboard/_components/stat-card.tsx";
import {
	useDashboardNotes,
	useDashboardRoles,
	useDashboardUsers,
} from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";

export const UserStat: FC = (): ReactElement => {
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

export const RoleStat: FC = (): ReactElement => {
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

export const NoteStat: FC = (): ReactElement => {
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
