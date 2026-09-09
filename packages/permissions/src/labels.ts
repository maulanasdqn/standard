import { PERMISSION, type TPermission } from "./permissions.ts";
import { ROLE, type TRole } from "./roles.ts";

export const PERMISSION_LABEL: Record<TPermission, string> = {
	[PERMISSION.NOTE_READ]: "View notes",
	[PERMISSION.NOTE_WRITE]: "Create & edit notes",
	[PERMISSION.NOTE_DELETE]: "Delete notes",
	[PERMISSION.USER_MANAGE]: "Manage users",
};

export const ROLE_LABEL: Record<TRole, string> = {
	[ROLE.ADMIN]: "Admin",
	[ROLE.MEMBER]: "Member",
	[ROLE.VIEWER]: "Viewer",
};
