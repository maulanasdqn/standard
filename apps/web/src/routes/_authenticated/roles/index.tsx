import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { RoleCreateForm } from "#/routes/_authenticated/roles/_components/role-create-form.tsx";
import { RoleList } from "#/routes/_authenticated/roles/_components/role-list.tsx";
import {
	roleListOptions,
	useRoleList,
} from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { RouteSkeleton } from "#/routes/_components/route-skeleton.tsx";
import { PageHeaderSkeleton } from "@app/components/skeleton/page-header-skeleton";
import { FormSkeleton } from "@app/components/skeleton/form-skeleton";
import { TableSkeleton } from "@app/components/skeleton/table-skeleton";

const RolesPage: FC = (): ReactElement => {
	const { data } = useRoleList();

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-xl font-semibold">{ROLE_MESSAGE.TITLE}</h1>
			<Guard permissions={[PERMISSION.USER_MANAGE]}>
				<RoleCreateForm />
			</Guard>
			<RoleList roles={data.items} />
		</div>
	);
};

const RolesPending: FC = (): ReactElement => (
	<RouteSkeleton>
		<PageHeaderSkeleton />
		<FormSkeleton fields={2} twoColumn />
		<TableSkeleton toolbar={false} pagination={false} columns={3} />
	</RouteSkeleton>
);

export const Route = createFileRoute("/_authenticated/roles/")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(roleListOptions()),
	component: RolesPage,
	pendingComponent: RolesPending,
});
