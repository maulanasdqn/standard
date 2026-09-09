import type { TPermission } from "@app/permissions";
import type { TMe } from "@app/schemas";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	ErrorComponent,
	Outlet,
} from "@tanstack/react-router";

type TRouterContext = {
	queryClient: QueryClient;
	session: TMe | null;
	permissions: readonly TPermission[];
};

export const Route = createRootRouteWithContext<TRouterContext>()({
	component: () => <Outlet />,
	errorComponent: ErrorComponent,
	notFoundComponent: () => (
		<div className="flex h-screen items-center justify-center text-sm text-neutral-500">
			Page not found.
		</div>
	),
});
