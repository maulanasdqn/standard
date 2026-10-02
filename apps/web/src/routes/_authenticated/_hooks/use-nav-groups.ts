import { usePermissions } from "@app/components/guard/use-permissions";
import { A } from "@mobily/ts-belt";
import {
	NAV_GROUPS,
	type TNavGroup,
	type TNavItem,
} from "#/routes/_authenticated/_constants/nav.ts";

export const useNavGroups = (): readonly TNavGroup[] => {
	const { canAll } = usePermissions();

	return A.filter(
		A.map(
			NAV_GROUPS,
			(group): TNavGroup => ({
				label: group.label,
				items: A.filter(group.items, (item: TNavItem): boolean =>
					canAll(item.permissions),
				),
			}),
		),
		(group): boolean => A.isNotEmpty(group.items),
	);
};
