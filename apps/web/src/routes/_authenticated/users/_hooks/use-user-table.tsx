import { formatDateTime } from "@app/format";
import { USER_MESSAGE } from "@app/messages";
import {
	USER_SORT,
	type TSortDirection,
	type TUser,
	type TUserList,
	type TUserSort,
} from "@app/schemas";
import { createColumnHelper, type ReactTable } from "@tanstack/react-table";
import { type ReactElement, useMemo } from "react";
import type { TTableFeatures } from "#/libs/table/features.ts";
import type { TListChange } from "#/libs/table/list-patch.ts";
import { useServerTable } from "#/routes/_authenticated/_hooks/use-server-table.ts";
import { UserActionsCell } from "#/routes/_authenticated/users/_components/user-actions-cell.tsx";
import { UserStatusBadge } from "#/routes/_authenticated/users/_components/user-status-badge.tsx";
import { userStatusOf } from "#/routes/_authenticated/users/_utils/user-status.ts";
import { UserRoleCell } from "#/routes/_authenticated/users/_components/user-role-cell.tsx";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import { useIsSelf } from "#/routes/_authenticated/users/_hooks/use-users.ts";

const helper = createColumnHelper<TTableFeatures, TUser>();

const getRowId = (user: TUser): string => user.id;

const SORT_KEYS: readonly TUserSort[] = [
	USER_SORT.NAME,
	USER_SORT.EMAIL,
	USER_SORT.ROLE,
	USER_SORT.CREATED_AT,
];

export type TUserTableInput = {
	list: TUserList;
	roleOptions: readonly TRoleOption[];
	sortBy: TUserSort;
	sortDir: TSortDirection;
	onChange: TListChange<TUserSort>;
};

export type TUserTable = {
	table: ReactTable<TTableFeatures, TUser>;
};

export const useUserTable = (input: TUserTableInput): TUserTable => {
	const { roleOptions } = input;
	const isSelf = useIsSelf();

	const columns = useMemo(
		() =>
			helper.columns([
				helper.accessor("name", {
					header: USER_MESSAGE.COLUMN_NAME,
					meta: { className: "font-medium" },
				}),
				helper.accessor("email", {
					header: USER_MESSAGE.COLUMN_EMAIL,
					meta: { className: "text-muted-foreground" },
				}),
				helper.accessor("role", {
					header: USER_MESSAGE.COLUMN_ROLE,
					cell: (context): ReactElement => (
						<UserRoleCell
							user={context.row.original}
							roleOptions={roleOptions}
						/>
					),
				}),
				helper.display({
					id: "status",
					header: USER_MESSAGE.COLUMN_STATUS,
					cell: (context): ReactElement => (
						<UserStatusBadge status={userStatusOf(context.row.original)} />
					),
				}),
				helper.accessor("createdAt", {
					header: USER_MESSAGE.COLUMN_CREATED,
					meta: { className: "text-muted-foreground" },
					cell: (context): string => formatDateTime(context.getValue()),
				}),
				helper.display({
					id: "actions",
					header: USER_MESSAGE.COLUMN_ACTIONS,
					enableHiding: false,
					meta: { className: "text-right" },
					cell: (context): ReactElement => (
						<UserActionsCell
							user={context.row.original}
							isSelf={isSelf(context.row.original.id)}
						/>
					),
				}),
			]),
		[roleOptions, isSelf],
	);

	const table = useServerTable({
		columns,
		data: input.list.items,
		getRowId,
		total: input.list.total,
		page: input.list.page,
		pageSize: input.list.pageSize,
		sortBy: input.sortBy,
		sortDir: input.sortDir,
		sortKeys: SORT_KEYS,
		onChange: input.onChange,
	});

	return { table };
};
