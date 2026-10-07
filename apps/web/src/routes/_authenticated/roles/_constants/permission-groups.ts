import {
	ALL_PERMISSIONS,
	permissionResourceOf,
	type TPermission,
} from "@app/permissions";
import { A } from "@mobily/ts-belt";

export type TPermissionGroup = {
	resource: string;
	permissions: readonly TPermission[];
};

const RESOURCES: readonly string[] = A.uniq(
	A.map(ALL_PERMISSIONS, permissionResourceOf),
);

export const PERMISSION_GROUPS: readonly TPermissionGroup[] = A.map(
	RESOURCES,
	(resource) => ({
		resource,
		permissions: A.filter(
			ALL_PERMISSIONS,
			(permission) => permissionResourceOf(permission) === resource,
		),
	}),
);
