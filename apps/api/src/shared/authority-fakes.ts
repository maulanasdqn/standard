import { PERMISSION, permissionsForRole, ROLE } from "@app/permissions";
import type { TActorAuthority } from "#/shared/session.ts";

export const SUPERADMIN_AUTHORITY: TActorAuthority = {
	role: ROLE.SUPERADMIN,
	permissions: permissionsForRole(ROLE.SUPERADMIN),
};

export const ADMIN_AUTHORITY: TActorAuthority = {
	role: ROLE.ADMIN,
	permissions: permissionsForRole(ROLE.ADMIN),
};

export const USER_MANAGER_AUTHORITY: TActorAuthority = {
	role: "user-manager",
	permissions: [
		PERMISSION.USER_READ,
		PERMISSION.USER_CREATE,
		PERMISSION.USER_UPDATE,
		PERMISSION.USER_DELETE,
		PERMISSION.ROLE_READ,
		PERMISSION.ROLE_UPDATE,
	],
};
