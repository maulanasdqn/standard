import type { TPermission } from "@app/permissions";
import { Store } from "@tanstack/store";

type TPermissionsState = {
	permissions: readonly TPermission[];
};

export const permissionsStore = new Store<TPermissionsState>({
	permissions: [],
});

export const setPermissions = (permissions: readonly TPermission[]): void => {
	permissionsStore.setState(() => ({ permissions }));
};

export const clearPermissions = (): void => {
	permissionsStore.setState(() => ({ permissions: [] }));
};
