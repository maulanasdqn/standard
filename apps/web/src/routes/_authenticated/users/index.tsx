import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { userListInputSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { ListPagination } from "#/routes/_authenticated/_components/list-pagination.tsx";
import { UserCreateForm } from "#/routes/_authenticated/users/_components/user-create-form.tsx";
import { UserSearch } from "#/routes/_authenticated/users/_components/user-search.tsx";
import { UserTable } from "#/routes/_authenticated/users/_components/user-table.tsx";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	useUserList,
	useUserPageChange,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";

export const Route = createFileRoute("/_authenticated/users/")({
	validateSearch: userListInputSchema,
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	component: UsersPage,
});

function UsersPage(): ReactElement {
	const { data, isLoading } = useUserList();
	const goToPage = useUserPageChange();
	const roleOptions = useRoleOptions();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<h1 className="text-xl font-semibold">Users</h1>
			<UserCreateForm roleOptions={roleOptions} />
			<UserSearch />
			{isLoading ? (
				<p className="text-sm text-neutral-500">Loading…</p>
			) : (
				<UserTable users={data?.items ?? []} roleOptions={roleOptions} />
			)}
			{data ? (
				<ListPagination pageInfo={data} noun="users" onPageChange={goToPage} />
			) : null}
		</div>
	);
}
