import { permissionsForRole, type TRole } from "@app/permissions";

export const isRole = (value: string): value is TRole =>
	value === "admin" || value === "member" || value === "viewer";

export const resolveRole = (value: string): TRole =>
	isRole(value) ? value : "viewer";

export const resolvePermissions = (role: string) =>
	permissionsForRole(resolveRole(role));
