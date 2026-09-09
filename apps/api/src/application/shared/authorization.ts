import { canAll, type TPermission } from "@app/permissions";
import { match } from "ts-pattern";
import { forbidden } from "#/application/shared/errors.ts";

export const assertPermissions = (
	granted: readonly TPermission[],
	required: readonly TPermission[],
): void => {
	match(canAll(granted, required))
		.with(false, () => {
			throw forbidden("You don't have permission to perform this action.");
		})
		.otherwise(() => undefined);
};
