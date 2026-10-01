import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { Button } from "@app/components/ui/button";
import { USER_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { userListInputSchema } from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Send } from "lucide-react";
import type { FC, ReactElement } from "react";
import { searchLenient } from "#/libs/table/search-lenient.ts";
import { roleListOptions } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { UserTable } from "#/routes/_authenticated/users/_components/user-table.tsx";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	userListOptions,
	useUserList,
	useUserListChange,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";
import { ListPageSkeleton } from "#/routes/_components/list-page-skeleton.tsx";

const userSearchValidate = searchLenient(userListInputSchema);

const UsersPage: FC = (): ReactElement => {
	const { data } = useUserList();
	const search = Route.useSearch();
	const onChange = useUserListChange();
	const roleOptions = useRoleOptions();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">{USER_MESSAGE.TITLE}</h1>
				<Guard permissions={[PERMISSION.USER_CREATE]}>
					<div className="flex items-center gap-2">
						<Button asChild size="sm" variant="outline">
							<Link to="/users/invite">
								<Send className="mr-1 size-4" />
								{USER_MESSAGE.INVITE_USER}
							</Link>
						</Button>
						<Button asChild size="sm">
							<Link to="/users/create">
								<Plus className="mr-1 size-4" />
								{USER_MESSAGE.NEW_USER}
							</Link>
						</Button>
					</div>
				</Guard>
			</div>
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

const UsersPending: FC = (): ReactElement => <ListPageSkeleton action />;

export const Route = createFileRoute("/_authenticated/users/")({
	validateSearch: userSearchValidate,
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.USER_READ, PERMISSION.ROLE_READ],
	}),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userListOptions(deps.search)),
			context.queryClient.ensureQueryData(roleListOptions()),
		]),
	component: UsersPage,
	pendingComponent: UsersPending,
});
