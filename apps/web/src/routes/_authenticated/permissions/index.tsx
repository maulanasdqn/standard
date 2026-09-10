import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { PermissionMatrix } from "#/routes/_authenticated/permissions/_components/permission-matrix.tsx";
import { usePermissionMatrix } from "#/routes/_authenticated/permissions/_hooks/use-permission-matrix.ts";

export const Route = createFileRoute("/_authenticated/permissions/")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	component: PermissionsPage,
});

function PermissionsPage(): ReactElement {
	const { roles, isLoading } = usePermissionMatrix();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-xl font-semibold">Permissions</h1>
				<p className="text-sm text-neutral-500">
					Permissions are defined in code. Assign them to roles on the Roles
					page.
				</p>
			</div>
			{isLoading ? (
				<p className="text-sm text-neutral-500">Loading…</p>
			) : (
				<PermissionMatrix roles={roles} />
			)}
		</div>
	);
}
