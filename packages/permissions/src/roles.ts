import { D } from "@mobily/ts-belt";
import {
	ALL_PERMISSIONS,
	PERMISSION,
	type TPermission,
} from "./permissions.ts";

export const ROLE = {
	ADMIN: "admin",
	MEMBER: "member",
	VIEWER: "viewer",
} as const;

export type TRole = (typeof ROLE)[keyof typeof ROLE];

export const ROLE_PERMISSIONS: Record<TRole, readonly TPermission[]> = {
	[ROLE.ADMIN]: ALL_PERMISSIONS,
	[ROLE.MEMBER]: [PERMISSION.NOTE_READ, PERMISSION.NOTE_WRITE],
	[ROLE.VIEWER]: [PERMISSION.NOTE_READ],
};

export const permissionsForRole = (role: TRole): readonly TPermission[] =>
	D.get(ROLE_PERMISSIONS, role) ?? [];
