import { NEWSLETTER_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { SearchBox } from "#/routes/_authenticated/_components/search-box.tsx";
import { useSubscriberSearch } from "#/routes/_authenticated/subscribers/_hooks/use-subscribers.ts";
import {
	type TSubscriberTableInput,
	useSubscriberTable,
} from "#/routes/_authenticated/subscribers/_hooks/use-subscriber-table.tsx";

export const SubscriberTable: FC<TSubscriberTableInput> = (
	props,
): ReactElement => {
	const table = useSubscriberTable(props);
	const search = useSubscriberSearch();

	return (
		<DataTable
			table={table}
			emptyMessage={NEWSLETTER_MESSAGE.EMPTY}
			toolbar={
				<SearchBox
					control={search}
					placeholder={NEWSLETTER_MESSAGE.SEARCH_PLACEHOLDER}
					label={NEWSLETTER_MESSAGE.SEARCH_PLACEHOLDER}
				/>
			}
			paginated
		/>
	);
};
