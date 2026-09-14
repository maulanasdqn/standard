import type { TPermission } from "@app/permissions";

export type TSessionUser = {
	id: string;
	email: string;
	name: string;
	role: string;
};

export type TSession = {
	user: TSessionUser;
	permissions: readonly TPermission[];
};
