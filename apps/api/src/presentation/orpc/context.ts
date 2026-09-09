import type { TPermission } from "@app/permissions";
import type { ISession } from "#/domain/session/session.ts";

export type ORPCContext = {
	headers: Headers;
	session: ISession | null;
	permissions: readonly TPermission[];
};
