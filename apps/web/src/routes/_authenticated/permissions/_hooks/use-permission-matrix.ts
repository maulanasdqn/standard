import type { TRoleDto } from "@app/schemas";
import { useRoleList } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

export type TPermissionMatrix = {
	roles: readonly TRoleDto[];
};

export const usePermissionMatrix = (): TPermissionMatrix => {
	const { data } = useRoleList();
	return { roles: data.items };
};
