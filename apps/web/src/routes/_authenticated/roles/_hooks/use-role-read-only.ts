import { usePermissions } from "@app/components/guard/use-permissions";
import { PERMISSION } from "@app/permissions";
import type { TRoleDto } from "@app/schemas";

export const useRoleReadOnly = (role: TRoleDto): boolean => {
	const { canAll } = usePermissions();
	return role.fixed || !canAll([PERMISSION.ROLE_UPDATE]);
};
