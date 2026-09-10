import type { TPermission } from "@app/permissions";
import type { TSession } from "#/domain/session/session.ts";

export type ORPCContext = {
	headers: Headers;
	session: TSession | null;
	permissions: readonly TPermission[];
};
