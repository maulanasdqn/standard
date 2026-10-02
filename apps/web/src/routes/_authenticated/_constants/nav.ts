import { NAV_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { PERMISSION, type TPermission } from "@app/permissions";
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	KeyRound,
	LayoutDashboard,
	Shield,
	StickyNote,
	Users,
} from "lucide-react";

export const NAV_ACTIVE_LAYOUT_ID = "nav-active-indicator";
export const NAV_HOVER_LAYOUT_ID = "nav-hover-indicator";

export const ROUTER_STATUS = {
	PENDING: "pending",
	IDLE: "idle",
} as const;

export type TNavItem = {
	to: LinkProps["to"];
	label: string;
	permissions: readonly TPermission[];
	icon: LucideIcon;
};

export type TNavGroup = {
	label: string;
	items: readonly TNavItem[];
};

const DASHBOARD_ITEM: TNavItem = {
	to: "/dashboard",
	label: NAV_MESSAGE.DASHBOARD,
	permissions: [],
	icon: LayoutDashboard,
};

const NOTES_ITEM: TNavItem = {
	to: "/notes",
	label: NAV_MESSAGE.NOTES,
	permissions: [PERMISSION.NOTE_READ],
	icon: StickyNote,
};

const ADMINISTRATION_ITEMS: readonly TNavItem[] = [
	{
		to: "/users",
		label: NAV_MESSAGE.USERS,
		permissions: [PERMISSION.USER_READ, PERMISSION.ROLE_READ],
		icon: Users,
	},
	{
		to: "/roles",
		label: NAV_MESSAGE.ROLES,
		permissions: [PERMISSION.ROLE_READ],
		icon: Shield,
	},
	{
		to: "/permissions",
		label: NAV_MESSAGE.PERMISSIONS,
		permissions: [PERMISSION.ROLE_READ],
		icon: KeyRound,
	},
	{
		to: "/activity",
		label: NAV_MESSAGE.ACTIVITY,
		permissions: [PERMISSION.ACTIVITY_READ],
		icon: Activity,
	},
];

export const NAV_GROUPS: readonly TNavGroup[] = [
	{ label: NAV_MESSAGE.GROUP_WORKSPACE, items: [DASHBOARD_ITEM, NOTES_ITEM] },
	{ label: NAV_MESSAGE.GROUP_ADMINISTRATION, items: ADMINISTRATION_ITEMS },
];

export const NAV_ITEMS: readonly TNavItem[] = A.flat(
	A.map(NAV_GROUPS, (group): readonly TNavItem[] => group.items),
);
