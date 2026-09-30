import type { FC, ReactElement } from "react";
import { APP_MESSAGE } from "@app/messages";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { RowActionsMenu } from "#/routes/_authenticated/_components/row-actions-menu.tsx";
import type { TRowAction } from "#/routes/_authenticated/_constants/row-action.ts";
import type { TConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

type TRowActionsCellProps = {
	actions: readonly TRowAction[];
	confirm: TConfirmedAction<void>;
	confirmTitle: string;
	confirmDescription: string;
};

export const RowActionsCell: FC<TRowActionsCellProps> = (
	props,
): ReactElement => (
	<>
		<RowActionsMenu actions={props.actions} />
		<ConfirmDialog
			open={props.confirm.open}
			title={props.confirmTitle}
			description={props.confirmDescription}
			confirmLabel={APP_MESSAGE.DELETE}
			destructive
			onOpenChange={props.confirm.onOpenChange}
			onConfirm={props.confirm.onConfirm}
		/>
	</>
);
