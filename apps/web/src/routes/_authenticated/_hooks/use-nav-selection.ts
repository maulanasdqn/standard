import { useMatchRoute, useRouterState } from "@tanstack/react-router";
import {
	ROUTER_STATUS,
	type TNavItem,
} from "#/routes/_authenticated/_constants/nav.ts";

type TNavTarget = TNavItem["to"];

export type TNavSelection = {
	isActive: (target: TNavTarget) => boolean;
};

export const useNavSelection = (): TNavSelection => {
	const matchRoute = useMatchRoute();
	const isNavigating = useRouterState({
		select: (state): boolean => state.status === ROUTER_STATUS.PENDING,
	});

	return {
		isActive: (target: TNavTarget): boolean =>
			!!matchRoute({ to: target, fuzzy: true, pending: isNavigating }),
	};
};
