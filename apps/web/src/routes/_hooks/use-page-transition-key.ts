import { A } from "@mobily/ts-belt";
import { useRouterState } from "@tanstack/react-router";

export const usePageTransitionKey = (): string =>
	useRouterState({
		select: (state): string =>
			A.last(state.matches)?.pathname ?? state.location.pathname,
	});
