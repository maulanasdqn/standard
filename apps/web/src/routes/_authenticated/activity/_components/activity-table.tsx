import { ACTIVITY_MESSAGE } from "@app/messages";
import type { TActivity } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { useActivityTable } from "#/routes/_authenticated/activity/_hooks/use-activity-table.tsx";

type TActivityTableProps = {
	entries: readonly TActivity[];
};

export const ActivityTable: FC<TActivityTableProps> = (props): ReactElement => {
	const table = useActivityTable(props.entries);

	return match(A.isEmpty(props.entries))
		.with(true, () => <EmptyState message={ACTIVITY_MESSAGE.EMPTY} />)
		.otherwise(() => <DataTable table={table} />);
};
