import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { RoleEditForm } from "#/routes/_authenticated/roles/_components/role-edit-form.tsx";
import {
	roleGetOptions,
	useRoleGet,
} from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { RouteSkeleton } from "#/routes/_components/route-skeleton.tsx";
import { PageHeaderSkeleton } from "@app/components/skeleton/page-header-skeleton";
import { FormSkeleton } from "@app/components/skeleton/form-skeleton";

const RoleEditPage: FC = (): ReactElement => {
	const { data } = useRoleGet();

	return (
		<div className="flex w-full flex-col gap-6">
			<h1 className="text-xl font-semibold">{data.label}</h1>
			<Guard permissions={[PERMISSION.USER_MANAGE]}>
				<RoleEditForm key={data.key} role={data} />
			</Guard>
		</div>
	);
};

const RoleEditPending: FC = (): ReactElement => (
	<RouteSkeleton>
		<PageHeaderSkeleton />
		<FormSkeleton fields={6} twoColumn />
	</RouteSkeleton>
);

export const Route = createFileRoute("/_authenticated/roles/$key")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(roleGetOptions(params.key)),
	component: RoleEditPage,
	pendingComponent: RoleEditPending,
});
