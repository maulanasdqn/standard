import type { ISession } from "#/domain/session/session.ts";

export type IAuthService = {
	getSession: (headers: Headers) => Promise<ISession | null>;
};
