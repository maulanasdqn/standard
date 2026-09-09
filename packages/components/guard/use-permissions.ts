import { canAll, canAny, type TPermission } from "@app/permissions";
import { useStore } from "@tanstack/react-store";
import { permissionsStore } from "./permissions-store.ts";

export const usePermissions = () => {
	const { permissions } = useStore(permissionsStore, (state) => state);

	return {
		permissions,
		canAll: (required: readonly TPermission[]) => canAll(permissions, required),
		canAny: (required: readonly TPermission[]) => canAny(permissions, required),
	};
};
