import { A, O } from "@mobily/ts-belt";
import { useMatchRoute, useRouterState } from "@tanstack/react-router";
import { navActiveTarget } from "#/libs/nav/nav-active.ts";
import {
	NAV_ITEMS,
	ROUTER_STATUS,
	type TNavItem,
} from "#/routes/_authenticated/_constants/nav.ts";

type TNavTarget = NonNullable<TNavItem["to"]>;

export type TNavSelection = {
	isActive: (target: TNavItem["to"]) => boolean;
};

const NAV_TARGETS: readonly TNavTarget[] = A.filterMap(
	NAV_ITEMS,
	(item): O.Option<TNavTarget> => O.fromNullable(item.to),
);

export const useNavSelection = (): TNavSelection => {
	const matchRoute = useMatchRoute();
	const isNavigating = useRouterState({
		select: (state): boolean => state.status === ROUTER_STATUS.PENDING,
	});

	const active = navActiveTarget(
		NAV_TARGETS,
		(target): boolean =>
			!!matchRoute({ to: target, fuzzy: true, pending: isNavigating }),
	);

	return {
		isActive: (target: TNavItem["to"]): boolean =>
			active !== undefined && target === active,
	};
};
