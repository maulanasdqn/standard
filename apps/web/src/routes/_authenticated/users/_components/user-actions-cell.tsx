import { USER_MESSAGE } from "@app/messages";
import type { TUser } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { RowActionsCell } from "#/routes/_authenticated/_components/row-actions-cell.tsx";
import { useUserRowActions } from "#/routes/_authenticated/users/_hooks/use-user-row-actions.ts";

type TUserActionsCellProps = {
	user: TUser;
	isSelf: boolean;
};

export const UserActionsCell: FC<TUserActionsCellProps> = (
	props,
): ReactElement => {
	const row = useUserRowActions(props.user, props.isSelf);

	return (
		<RowActionsCell
			actions={row.actions}
			confirm={row.confirm}
			confirmTitle={USER_MESSAGE.DELETE_CONFIRM_TITLE}
			confirmDescription={USER_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
		/>
	);
};
