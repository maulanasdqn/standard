import { PERMISSION } from "@app/permissions";

export const NAV_ITEMS = [
	{ to: "/notes", label: "Notes", permissions: [PERMISSION.NOTE_READ] },
	{ to: "/users", label: "Users", permissions: [PERMISSION.USER_MANAGE] },
	{ to: "/roles", label: "Roles", permissions: [PERMISSION.USER_MANAGE] },
	{
		to: "/permissions",
		label: "Permissions",
		permissions: [PERMISSION.USER_MANAGE],
	},
	{
		to: "/activity",
		label: "Activity",
		permissions: [PERMISSION.ACTIVITY_READ],
	},
	{ to: "/account", label: "Account", permissions: [] },
] as const;

export type TNavItem = (typeof NAV_ITEMS)[number];
