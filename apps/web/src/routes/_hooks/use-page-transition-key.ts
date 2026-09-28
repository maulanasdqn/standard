import { useRouterState } from "@tanstack/react-router";

export const usePageTransitionKey = (): string =>
	useRouterState({
		select: (state): string =>
			state.resolvedLocation?.pathname ?? state.location.pathname,
	});
