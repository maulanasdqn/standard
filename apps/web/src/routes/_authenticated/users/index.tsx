import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { userListInputSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { roleListOptions } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { UserCreateForm } from "#/routes/_authenticated/users/_components/user-create-form.tsx";
import { UserTable } from "#/routes/_authenticated/users/_components/user-table.tsx";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	userListOptions,
	useUserList,
	useUserListChange,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";

const UsersPage: FC = (): ReactElement => {
	const { data } = useUserList();
	const search = Route.useSearch();
	const onChange = useUserListChange();
	const roleOptions = useRoleOptions();

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-xl font-semibold">Users</h1>
			<Guard permissions={[PERMISSION.USER_MANAGE]}>
				<UserCreateForm roleOptions={roleOptions} />
			</Guard>
			<UserTable
				list={data}
				roleOptions={roleOptions}
				sortBy={search.sortBy}
				sortDir={search.sortDir}
				onChange={onChange}
			/>
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
