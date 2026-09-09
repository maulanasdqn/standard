import {
	permissionsForRole,
	type TPermission,
	type TRole,
} from "@app/permissions";
import { match, P } from "ts-pattern";

export const isRole = (value: string): value is TRole =>
	match(value)
		.with(P.union("admin", "member", "viewer"), () => true)
		.otherwise(() => false);

export const resolveRole = (value: string): TRole =>
	isRole(value) ? value : "viewer";

export const resolvePermissions = (role: string): readonly TPermission[] =>
	permissionsForRole(resolveRole(role));
