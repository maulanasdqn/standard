import { USER_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { useUserRowOpen } from "#/routes/_authenticated/users/_hooks/use-user-row-actions.ts";
import { UserFilters } from "#/routes/_authenticated/users/_components/user-filters.tsx";
import { SearchBox } from "#/routes/_authenticated/_components/search-box.tsx";
import { useUserSearch } from "#/routes/_authenticated/users/_hooks/use-users.ts";
import {
	type TUserTableInput,
	useUserTable,
} from "#/routes/_authenticated/users/_hooks/use-user-table.tsx";

export const UserTable: FC<TUserTableInput> = (props): ReactElement => {
	const { table } = useUserTable(props);
	const search = useUserSearch();
	const openRow = useUserRowOpen();

	return (
		<DataTable
			table={table}
			emptyMessage={USER_MESSAGE.EMPTY}
			toolbar={
				<div className="flex flex-wrap items-center gap-2">
					<SearchBox
						control={search}
						placeholder={USER_MESSAGE.SEARCH_PLACEHOLDER}
						label={USER_MESSAGE.SEARCH_LABEL}
					/>
					<UserFilters />
				</div>
			}
			paginated
			onRowClick={openRow}
		/>
	);
};
