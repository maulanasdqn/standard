import type { TPermission, TRole } from "@app/permissions";

export type ISessionUser = {
	id: string;
	email: string;
	name: string;
	role: TRole;
};

export type ISession = {
	user: ISessionUser;
	permissions: readonly TPermission[];
};
