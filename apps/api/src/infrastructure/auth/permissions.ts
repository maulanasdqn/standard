import {
	permissionsForRole,
	ROLE,
	type TPermission,
	type TRole,
} from "@app/permissions";
import { match, P } from "ts-pattern";

export const isRole = (value: string): value is TRole =>
	match(value)
		.with(P.union(ROLE.ADMIN, ROLE.MEMBER, ROLE.VIEWER), () => true)
		.otherwise(() => false);

export const roleResolve = (value: string): TRole =>
	isRole(value) ? value : ROLE.VIEWER;

export const permissionsResolve = (role: string): readonly TPermission[] =>
	permissionsForRole(roleResolve(role));
