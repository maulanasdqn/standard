import { PERMISSION, type TPermission } from "@app/permissions";
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	CircleUser,
	KeyRound,
	LayoutDashboard,
	Shield,
	StickyNote,
	Users,
} from "lucide-react";

export type TNavItem = {
	to: LinkProps["to"];
	label: string;
	permissions: readonly TPermission[];
	icon: LucideIcon;
};

export const NAV_ITEMS: readonly TNavItem[] = [
	{
		to: "/dashboard",
		label: "Dashboard",
		permissions: [],
		icon: LayoutDashboard,
	},
	{
		to: "/notes",
		label: "Notes",
		permissions: [PERMISSION.NOTE_READ],
		icon: StickyNote,
	},
	{
		to: "/users",
		label: "Users",
		permissions: [PERMISSION.USER_MANAGE],
		icon: Users,
	},
	{
		to: "/roles",
		label: "Roles",
		permissions: [PERMISSION.USER_MANAGE],
		icon: Shield,
	},
	{
		to: "/permissions",
		label: "Permissions",
		permissions: [PERMISSION.USER_MANAGE],
		icon: KeyRound,
	},
	{
		to: "/activity",
		label: "Activity",
		permissions: [PERMISSION.ACTIVITY_READ],
		icon: Activity,
	},
	{
		to: "/account",
		label: "Account",
		permissions: [],
		icon: CircleUser,
	},
];
