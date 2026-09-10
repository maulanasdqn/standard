import { A, D } from "@mobily/ts-belt";

export const PERMISSION = {
	NOTE_READ: "note:read",
	NOTE_WRITE: "note:write",
	NOTE_DELETE: "note:delete",
	USER_MANAGE: "user:manage",
	ACTIVITY_READ: "activity:read",
} as const;

export type TPermission = (typeof PERMISSION)[keyof typeof PERMISSION];

export const ALL_PERMISSIONS: readonly TPermission[] = D.values(PERMISSION);

export const isPermission = (value: string): value is TPermission =>
	A.some(ALL_PERMISSIONS, (permission) => permission === value);
