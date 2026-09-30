import { NAV_MESSAGE } from "@app/messages";
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

export const NAV_ITEMS: readonly TNavItem[] = [
	{
		to: "/dashboard",
		label: NAV_MESSAGE.DASHBOARD,
		permissions: [],
		icon: LayoutDashboard,
	},
	{
		to: "/notes",
		label: NAV_MESSAGE.NOTES,
		permissions: [PERMISSION.NOTE_READ],
		icon: StickyNote,
	},
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
