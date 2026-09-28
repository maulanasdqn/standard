import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { RolePage } from "#/routes/_authenticated/roles/_components/role-page.tsx";
import { RolePageSkeleton } from "#/routes/_authenticated/roles/_components/role-page-skeleton.tsx";
import {
	roleGetOptions,
	useRoleGet,
} from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

const RoleViewPage: FC = (): ReactElement => {
	const { data } = useRoleGet(Route.useParams().key);
	return <RolePage role={data} readOnly editable={!data.fixed} />;
};

export const Route = createFileRoute("/_authenticated/roles/$key/")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.ROLE_READ] }),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(roleGetOptions(params.key)),
	component: RoleViewPage,
	pendingComponent: RolePageSkeleton,
});
