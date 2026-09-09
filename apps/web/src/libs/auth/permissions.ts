import { setPermissions } from "@app/components/guard/permissions-store";
import type { TPermission } from "@app/permissions";
import type { TMe } from "@app/schemas";

export const syncPermissions = (me: TMe | null): void => {
	setPermissions((me?.permissions ?? []) as TPermission[]);
};
