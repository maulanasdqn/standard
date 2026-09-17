import { ACTIVITY_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { ActivityFilters } from "#/routes/_authenticated/activity/_components/activity-filters.tsx";
import {
	type TActivityTableInput,
	useActivityTable,
} from "#/routes/_authenticated/activity/_hooks/use-activity-table.tsx";

export const ActivityTable: FC<TActivityTableInput> = (props): ReactElement => {
	const table = useActivityTable(props);

	return match(A.isEmpty(props.list.items))
		.with(true, () => <EmptyState message={ACTIVITY_MESSAGE.EMPTY} />)
		.otherwise(() => (
			<DataTable table={table} toolbar={<ActivityFilters />} paginated />
		));
};
