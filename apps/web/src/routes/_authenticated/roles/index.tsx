import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { RoleCreateForm } from "#/routes/_authenticated/roles/_components/role-create-form.tsx";
import { RoleList } from "#/routes/_authenticated/roles/_components/role-list.tsx";
import {
	roleListOptions,
	useRoleList,
} from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

const RolesPage: FC = (): ReactElement => {
	const { data } = useRoleList();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<h1 className="text-xl font-semibold">Roles</h1>
			<RoleCreateForm />
			<RoleList roles={data.items} />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/roles/")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(roleListOptions()),
	component: RolesPage,
});
