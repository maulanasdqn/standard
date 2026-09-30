import { ROLE_MESSAGE } from "@app/messages";
import type { TRoleDto } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { useRoleRowOpen } from "#/routes/_authenticated/roles/_hooks/use-role-row-actions.ts";
import { useRoleTable } from "#/routes/_authenticated/roles/_hooks/use-role-table.tsx";

type TRoleListProps = {
	roles: readonly TRoleDto[];
};

export const RoleList: FC<TRoleListProps> = (props): ReactElement => {
	const table = useRoleTable(props.roles);
	const openRow = useRoleRowOpen();

	return (
		<DataTable
			table={table}
			emptyMessage={ROLE_MESSAGE.EMPTY}
			onRowClick={openRow}
		/>
	);
};
