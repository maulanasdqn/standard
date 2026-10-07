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

export const SESSION_STATE = {
	RESOLVED: "resolved",
	ANONYMOUS: "anonymous",
	UNAVAILABLE: "unavailable",
} as const;

export type TSessionState = (typeof SESSION_STATE)[keyof typeof SESSION_STATE];

export type TActorAuthority = {
	role: string;
	permissions: readonly TPermission[];
};

export const actorAuthorityOf = (session: TSession): TActorAuthority => ({
	role: session.user.role,
	permissions: session.permissions,
});
