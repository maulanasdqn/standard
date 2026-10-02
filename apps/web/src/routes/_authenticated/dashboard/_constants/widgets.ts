import { DASHBOARD_MESSAGE } from "@app/messages";
import { PERMISSION, type TPermission } from "@app/permissions";
import type { LinkProps } from "@tanstack/react-router";
import type { FC } from "react";
import {
	NoteStat,
	RoleStat,
	UserStat,
} from "#/routes/_authenticated/dashboard/_components/stats.tsx";

export const DASHBOARD_STAT = {
	NOTES: "notes",
	USERS: "users",
	ROLES: "roles",
} as const;

export type TDashboardStatId =
	(typeof DASHBOARD_STAT)[keyof typeof DASHBOARD_STAT];

export type TDashboardStat = {
	id: TDashboardStatId;
	permissions: readonly TPermission[];
	component: FC;
};

export type TDashboardAction = {
	to: LinkProps["to"];
	label: string;
	permissions: readonly TPermission[];
};

export const DASHBOARD_STATS: readonly TDashboardStat[] = [
	{
		id: DASHBOARD_STAT.NOTES,
		permissions: [PERMISSION.NOTE_READ],
		component: NoteStat,
	},
	{
		id: DASHBOARD_STAT.USERS,
		permissions: [PERMISSION.USER_READ],
		component: UserStat,
	},
	{
		id: DASHBOARD_STAT.ROLES,
		permissions: [PERMISSION.ROLE_READ],
		component: RoleStat,
	},
];

export const DASHBOARD_ACTIONS: readonly TDashboardAction[] = [
	{
		to: "/notes/create",
		label: DASHBOARD_MESSAGE.CREATE_NOTE,
		permissions: [PERMISSION.NOTE_CREATE],
	},
	{
		to: "/users/create",
		label: DASHBOARD_MESSAGE.CREATE_USER,
		permissions: [PERMISSION.USER_CREATE, PERMISSION.ROLE_READ],
	},
];
