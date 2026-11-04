import { useRouterState } from "@tanstack/react-router";

export const useRouteLoading = (): boolean =>
	useRouterState({ select: (state) => state.isLoading });
