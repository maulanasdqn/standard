import { USER_MESSAGE } from "@app/messages";
import type { TUser } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
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
		<>
			<RowActionsCell
				actions={row.actions}
				confirm={row.confirm}
				confirmTitle={USER_MESSAGE.DELETE_CONFIRM_TITLE}
				confirmDescription={USER_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
			/>
			<ConfirmDialog
				open={row.accessConfirm.open}
				title={
					row.deactivated
						? USER_MESSAGE.REACTIVATE_CONFIRM_TITLE
						: USER_MESSAGE.DEACTIVATE_CONFIRM_TITLE
				}
				description={
					row.deactivated
						? USER_MESSAGE.REACTIVATE_CONFIRM_DESCRIPTION
						: USER_MESSAGE.DEACTIVATE_CONFIRM_DESCRIPTION
				}
				confirmLabel={
					row.deactivated
						? USER_MESSAGE.ACTION_REACTIVATE
						: USER_MESSAGE.ACTION_DEACTIVATE
				}
				destructive={!row.deactivated}
				onOpenChange={row.accessConfirm.onOpenChange}
				onConfirm={row.accessConfirm.onConfirm}
			/>
		</>
	);
};
