import { USER_MESSAGE } from "@app/messages";
import type { TUser } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import { useUserTable } from "#/routes/_authenticated/users/_hooks/use-user-table.tsx";

type TUserTableProps = {
	users: readonly TUser[];
	roleOptions: readonly TRoleOption[];
};

export const UserTable: FC<TUserTableProps> = (props): ReactElement => {
	const { table, roleChange } = useUserTable(props.users, props.roleOptions);

	return match(A.isEmpty(props.users))
		.with(true, () => <EmptyState message={USER_MESSAGE.EMPTY} />)
		.otherwise(() => (
			<>
				<DataTable table={table} />
				<ConfirmDialog
					open={roleChange.open}
					title={USER_MESSAGE.ROLE_CHANGE_CONFIRM_TITLE}
					description={USER_MESSAGE.ROLE_CHANGE_CONFIRM_DESCRIPTION}
					onOpenChange={roleChange.onOpenChange}
					onConfirm={roleChange.onConfirm}
				/>
			</>
		));
};
