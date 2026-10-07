import { A, S } from "@mobily/ts-belt";

const KEY_SEPARATOR = ":";
const NO_RESOURCE = "";

export const permissionResourceOf = (permission: string): string => {
	const resource = A.join(
		A.initOrEmpty(S.split(permission, KEY_SEPARATOR)),
		KEY_SEPARATOR,
	);
	return resource === NO_RESOURCE ? permission : resource;
};
