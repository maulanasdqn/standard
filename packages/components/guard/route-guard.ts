import { canAll, type TPermission } from "@app/permissions";
import { redirect } from "@tanstack/react-router";

type TRouteContext = {
	permissions: readonly TPermission[];
};

/**
 * A `beforeLoad` guard for TanStack Router routes: redirects to `/` when the
 * current session lacks one of the required permissions.
 */
export const checkRoutePermissions =
	({ permissions }: { permissions: readonly TPermission[] }) =>
	({ context }: { context: TRouteContext }) => {
		if (!canAll(context.permissions, permissions)) {
			throw redirect({ to: "/" });
		}
	};
