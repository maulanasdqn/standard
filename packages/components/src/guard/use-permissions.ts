import { canAll, canAny, type TPermission } from "@app/permissions";
import { useSelector } from "@tanstack/react-store";
import { permissionsStore } from "./permissions-store.ts";

export type TUsePermissions = {
	permissions: readonly TPermission[];
	canAll: (required: readonly TPermission[]) => boolean;
	canAny: (required: readonly TPermission[]) => boolean;
};

export const usePermissions = (): TUsePermissions => {
	const permissions = useSelector(
		permissionsStore,
		(state) => state.permissions,
	);

	return {
		permissions,
		canAll: (required: readonly TPermission[]): boolean =>
			canAll(permissions, required),
		canAny: (required: readonly TPermission[]): boolean =>
			canAny(permissions, required),
	};
};
