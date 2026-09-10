import type { TPermission, TRole } from "@app/permissions";

export type TSessionUser = {
	id: string;
	email: string;
	name: string;
	role: TRole;
};

export type TSession = {
	user: TSessionUser;
	permissions: readonly TPermission[];
};
