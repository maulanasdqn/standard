import { canAll, type TPermission } from "@app/permissions";
import { forbidden } from "#/application/shared/errors.ts";

export const assertPermissions = (
	granted: readonly TPermission[],
	required: readonly TPermission[],
): void => {
	if (!canAll(granted, required)) {
		throw forbidden("You don't have permission to perform this action.");
	}
};
