import type { TPermission } from "@app/permissions";
import type { TAppRuntime } from "#/bootstrap/compose.ts";
import type { TSession } from "#/shared/session.ts";

export type TORPCContext = {
	headers: Headers;
	session: TSession | null;
	permissions: readonly TPermission[];
	runtime: TAppRuntime;
};
