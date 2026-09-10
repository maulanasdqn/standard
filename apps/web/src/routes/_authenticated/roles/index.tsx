import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { RoleCreateForm } from "#/routes/_authenticated/roles/_components/role-create-form.tsx";
import { RoleList } from "#/routes/_authenticated/roles/_components/role-list.tsx";
import { useRoleList } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

export const Route = createFileRoute("/_authenticated/roles/")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	component: RolesPage,
});

function RolesPage(): ReactElement {
	const { data, isLoading } = useRoleList();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<h1 className="text-xl font-semibold">Roles</h1>
			<RoleCreateForm />
			{isLoading ? (
				<p className="text-sm text-neutral-500">Loading…</p>
			) : (
				<RoleList roles={data?.items ?? []} />
			)}
		</div>
	);
}
