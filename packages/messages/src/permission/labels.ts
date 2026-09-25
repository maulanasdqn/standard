import type { TPermission, TRole } from "@app/permissions";

export const PERMISSION_LABEL = {
	"note:read": "View notes",
	"note:write": "Create & edit notes",
	"note:delete": "Delete notes",
	"user:manage": "Manage users",
	"activity:read": "View the activity log",
} as const satisfies Record<TPermission, string>;

export const ROLE_LABEL = {
	superadmin: "Superadmin",
	admin: "Admin",
	member: "Member",
	viewer: "Viewer",
} as const satisfies Record<TRole, string>;

export const ROLE_DESCRIPTION = {
	superadmin: "Full access, including ownership bypass.",
	admin: "Full access, including user and role management.",
	member: "Can view, create and edit content.",
	viewer: "Read-only access.",
} as const satisfies Record<TRole, string>;

const isLabelledRole = (role: string): role is TRole =>
	Object.hasOwn(ROLE_LABEL, role);

export const roleLabel = (role: string): string =>
	isLabelledRole(role) ? ROLE_LABEL[role] : role;
