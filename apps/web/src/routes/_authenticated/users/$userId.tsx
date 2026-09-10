import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { match, P } from "ts-pattern";
import { UserEditForm } from "#/routes/_authenticated/users/_components/user-edit-form.tsx";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import { useUserGet } from "#/routes/_authenticated/users/_hooks/use-users.ts";

export const Route = createFileRoute("/_authenticated/users/$userId")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	component: UserEditPage,
});

function UserEditPage(): ReactElement {
	const { data, isLoading } = useUserGet();
	const roleOptions = useRoleOptions();

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-xl font-semibold">Edit user</h1>
			{match({ isLoading, data })
				.with({ isLoading: true }, () => (
					<p className="text-sm text-neutral-500">Loading…</p>
				))
				.with({ data: P.nonNullable }, ({ data: user }) => (
					<UserEditForm user={user} roleOptions={roleOptions} />
				))
				.otherwise(() => (
					<p className="text-sm text-neutral-500">User not found.</p>
				))}
		</div>
	);
}
