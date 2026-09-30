import { ROLE_MESSAGE } from "@app/messages";
import type { TRoleDto } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { RowActionsCell } from "#/routes/_authenticated/_components/row-actions-cell.tsx";
import { useRoleRowActions } from "#/routes/_authenticated/roles/_hooks/use-role-row-actions.ts";

type TRoleActionsCellProps = {
	role: TRoleDto;
};

export const RoleActionsCell: FC<TRoleActionsCellProps> = (
	props,
): ReactElement => {
	const row = useRoleRowActions(props.role);

	return (
		<RowActionsCell
			actions={row.actions}
			confirm={row.confirm}
			confirmTitle={ROLE_MESSAGE.DELETE_CONFIRM_TITLE}
			confirmDescription={ROLE_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
		/>
	);
};
