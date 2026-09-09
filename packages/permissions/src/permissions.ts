export const PERMISSION = {
	NOTE_READ: "note:read",
	NOTE_WRITE: "note:write",
	NOTE_DELETE: "note:delete",
	USER_MANAGE: "user:manage",
} as const;

export type TPermission = (typeof PERMISSION)[keyof typeof PERMISSION];

export const ALL_PERMISSIONS: readonly TPermission[] =
	Object.values(PERMISSION);
