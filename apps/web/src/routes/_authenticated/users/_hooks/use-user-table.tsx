import { formatDateTime } from "@app/format";
import { USER_MESSAGE } from "@app/messages";
import type { TUser, TUserUpdateInput } from "@app/schemas";
import {
	createColumnHelper,
	type ReactTable,
	useTable,
} from "@tanstack/react-table";
import type { ReactElement } from "react";
import { TABLE_FEATURES, type TTableFeatures } from "#/libs/table/features.ts";
import {
	type TConfirmedAction,
	useConfirmedAction,
} from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { UserActionsCell } from "#/routes/_authenticated/users/_components/user-actions-cell.tsx";
import { UserRoleCell } from "#/routes/_authenticated/users/_components/user-role-cell.tsx";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	useIsSelf,
	useUserUpdate,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";

const helper = createColumnHelper<TTableFeatures, TUser>();

const getRowId = (user: TUser): string => user.id;

export type TUserTable = {
	table: ReactTable<TTableFeatures, TUser>;
	roleChange: TConfirmedAction<TUserUpdateInput>;
};

export const useUserTable = (
	users: readonly TUser[],
	roleOptions: readonly TRoleOption[],
): TUserTable => {
	const userUpdate = useUserUpdate();
	const isSelf = useIsSelf();
	const roleChange = useConfirmedAction<TUserUpdateInput>((input) =>
		userUpdate.mutate(input),
	);

	const columns = helper.columns([
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
					disabled={isSelf(context.row.original.id) || userUpdate.isPending}
					onChange={(role) =>
						roleChange.request({ id: context.row.original.id, role })
					}
				/>
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
			meta: { className: "text-right" },
			cell: (context): ReactElement => (
				<UserActionsCell
					user={context.row.original}
					isSelf={isSelf(context.row.original.id)}
				/>
			),
		}),
	]);

	const table = useTable({
		features: TABLE_FEATURES,
		columns,
		data: users,
		getRowId,
	});

	return { table, roleChange };
};
