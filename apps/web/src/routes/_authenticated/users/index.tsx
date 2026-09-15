import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { userListInputSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { ListPagination } from "#/routes/_authenticated/_components/list-pagination.tsx";
import { roleListOptions } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { UserCreateForm } from "#/routes/_authenticated/users/_components/user-create-form.tsx";
import { UserSearch } from "#/routes/_authenticated/users/_components/user-search.tsx";
import { UserTable } from "#/routes/_authenticated/users/_components/user-table.tsx";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	userListOptions,
	useUserList,
	useUserPageChange,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";

const UsersPage: FC = (): ReactElement => {
	const { data } = useUserList();
	const goToPage = useUserPageChange();
	const roleOptions = useRoleOptions();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<h1 className="text-xl font-semibold">Users</h1>
			<UserCreateForm roleOptions={roleOptions} />
			<UserSearch />
			<UserTable users={data.items} roleOptions={roleOptions} />
			<ListPagination pageInfo={data} noun="users" onPageChange={goToPage} />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/users/")({
	validateSearch: userListInputSchema,
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userListOptions(deps.search)),
			context.queryClient.ensureQueryData(roleListOptions()),
		]),
	component: UsersPage,
});
