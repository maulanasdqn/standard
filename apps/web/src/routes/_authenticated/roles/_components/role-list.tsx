import { ROLE_MESSAGE } from "@app/messages";
import type { TRoleDto } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { useRoleTable } from "#/routes/_authenticated/roles/_hooks/use-role-table.tsx";

type TRoleListProps = {
	roles: readonly TRoleDto[];
};

export const RoleList: FC<TRoleListProps> = (props): ReactElement => {
	const table = useRoleTable(props.roles);

	return match(A.isEmpty(props.roles))
		.with(true, () => <EmptyState message={ROLE_MESSAGE.EMPTY} />)
		.otherwise(() => <DataTable table={table} />);
};
