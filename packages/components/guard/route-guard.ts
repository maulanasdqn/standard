import { canAll, type TPermission } from "@app/permissions";
import { redirect } from "@tanstack/react-router";
import { match } from "ts-pattern";

type TRouteContext = {
	permissions: readonly TPermission[];
};

type TCheckRoutePermissionsOptions = {
	permissions: readonly TPermission[];
};

export const checkRoutePermissions =
	({ permissions }: TCheckRoutePermissionsOptions) =>
	({ context }: { context: TRouteContext }): void => {
		match(canAll(context.permissions, permissions))
			.with(false, () => {
				throw redirect({ to: "/" });
			})
			.otherwise(() => undefined);
	};
