import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { match, P } from "ts-pattern";
import { RoleEditForm } from "#/routes/_authenticated/roles/_components/role-edit-form.tsx";
import { useRoleGet } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

export const Route = createFileRoute("/_authenticated/roles/$key")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	component: RoleEditPage,
});

function RoleEditPage(): ReactElement {
	const { data, isLoading } = useRoleGet();

	return (
		<div className="flex max-w-3xl flex-col gap-6">
			<h1 className="text-xl font-semibold">{data?.label ?? "Role"}</h1>
			{match({ isLoading, data })
				.with({ isLoading: true }, () => (
					<p className="text-sm text-neutral-500">Loading…</p>
				))
				.with({ data: P.nonNullable }, ({ data: role }) => (
					<RoleEditForm key={role.key} role={role} />
				))
				.otherwise(() => (
					<p className="text-sm text-neutral-500">Role not found.</p>
				))}
		</div>
	);
}
