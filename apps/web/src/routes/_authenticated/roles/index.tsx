import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import { ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { RoleList } from "#/routes/_authenticated/roles/_components/role-list.tsx";
import {
	roleListOptions,
	useRoleList,
} from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { searchLenient } from "#/libs/table/search-lenient.ts";
import { roleListSearchSchema } from "#/routes/_authenticated/roles/_constants/role-filter.ts";
import { rolesFiltered } from "#/routes/_authenticated/roles/_utils/role-filter.ts";
import { ListPageSkeleton } from "#/routes/_components/list-page-skeleton.tsx";

const RolesPage: FC = (): ReactElement => {
	const { data } = useRoleList();
	const search = Route.useSearch();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">{ROLE_MESSAGE.TITLE}</h1>
				<Guard permissions={[PERMISSION.ROLE_CREATE]}>
					<Button asChild size="sm">
						<Link to="/roles/create">
							<Plus className="mr-1 size-4" />
							{ROLE_MESSAGE.NEW_ROLE}
						</Link>
					</Button>
				</Guard>
			</div>
			<RoleList roles={rolesFiltered(data.items, search)} />
		</div>
	);
};

const RolesPending: FC = (): ReactElement => (
	<ListPageSkeleton action pagination={false} columns={5} />
);

export const Route = createFileRoute("/_authenticated/roles/")({
	validateSearch: searchLenient(roleListSearchSchema),
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.ROLE_READ] }),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(roleListOptions()),
	component: RolesPage,
	pendingComponent: RolesPending,
});
