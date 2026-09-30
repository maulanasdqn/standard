import { usePermissions } from "@app/components/guard/use-permissions";
import { A } from "@mobily/ts-belt";
import type { TRowAction } from "#/routes/_authenticated/_constants/row-action.ts";

export const useVisibleRowActions = (
	actions: readonly TRowAction[],
): readonly TRowAction[] => {
	const { canAll } = usePermissions();

	return A.filter(
		actions,
		(action) => (action.available ?? true) && canAll(action.permissions),
	);
};
