import type { TPermission, TRole } from "@app/permissions";

export const ROLE_KEY = {
	ADMIN: "admin",
	MEMBER: "member",
	VIEWER: "viewer",
} as const satisfies Record<string, TRole>;

export const ROLE_LABEL = {
	[ROLE_KEY.ADMIN]: "Admin",
	[ROLE_KEY.MEMBER]: "Member",
	[ROLE_KEY.VIEWER]: "Viewer",
} as const satisfies Record<TRole, string>;

export const FIXED_ROLE_KEYS: readonly TRole[] = [
	ROLE_KEY.ADMIN,
	ROLE_KEY.MEMBER,
	ROLE_KEY.VIEWER,
];

export const PERMISSION_KEY = {
	NOTE_READ: "note:read",
	NOTE_WRITE: "note:write",
} as const satisfies Record<string, TPermission>;

export const PERMISSION_LABEL = {
	[PERMISSION_KEY.NOTE_READ]: "View notes",
	[PERMISSION_KEY.NOTE_WRITE]: "Create & edit notes",
} as const satisfies Partial<Record<TPermission, string>>;
