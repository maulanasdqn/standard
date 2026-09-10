import { PERMISSION, type TPermission } from "./permissions.ts";
import { isRole, ROLE, type TRole } from "./roles.ts";

export const PERMISSION_LABEL: Record<TPermission, string> = {
	[PERMISSION.NOTE_READ]: "View notes",
	[PERMISSION.NOTE_WRITE]: "Create & edit notes",
	[PERMISSION.NOTE_DELETE]: "Delete notes",
	[PERMISSION.USER_MANAGE]: "Manage users",
	[PERMISSION.ACTIVITY_READ]: "View the activity log",
};

export const ROLE_LABEL: Record<TRole, string> = {
	[ROLE.ADMIN]: "Admin",
	[ROLE.MEMBER]: "Member",
	[ROLE.VIEWER]: "Viewer",
};

export const ROLE_DESCRIPTION: Record<TRole, string> = {
	[ROLE.ADMIN]: "Full access, including user and role management.",
	[ROLE.MEMBER]: "Can view, create and edit notes.",
	[ROLE.VIEWER]: "Read-only access to notes.",
};

export const roleLabel = (role: string): string =>
	isRole(role) ? ROLE_LABEL[role] : role;
