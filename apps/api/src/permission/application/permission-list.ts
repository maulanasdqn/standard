import { ALL_PERMISSIONS, PERMISSION_LABEL } from "@app/permissions";
import type { TPermissionList } from "@app/schemas";
import { A } from "@mobily/ts-belt";

export const permissionList = (): TPermissionList => ({
	items: A.map(ALL_PERMISSIONS, (key) => ({
		key,
		label: PERMISSION_LABEL[key],
	})),
});
