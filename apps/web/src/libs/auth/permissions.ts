import { setPermissions } from "@app/components/guard/permissions-store";
import type { TMe } from "@app/schemas";

export const permissionsSync = (me: TMe | null): void => {
	setPermissions(me?.permissions ?? []);
};
