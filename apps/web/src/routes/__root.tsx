import type { TPermission } from "@app/permissions";
import type { TMe } from "@app/schemas";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	ErrorComponent,
	Outlet,
} from "@tanstack/react-router";
import type { ReactElement } from "react";

type TRouterContext = {
	queryClient: QueryClient;
	session: TMe | null;
	permissions: readonly TPermission[];
};

const NotFound = (): ReactElement => (
	<div className="flex h-screen items-center justify-center text-sm text-neutral-500">
		Page not found.
	</div>
);

export const Route = createRootRouteWithContext<TRouterContext>()({
	component: (): ReactElement => <Outlet />,
	errorComponent: ErrorComponent,
	notFoundComponent: NotFound,
});
