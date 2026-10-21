import { NEWSLETTER_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { SubscriberSearch } from "#/routes/_authenticated/subscribers/_components/subscriber-search.tsx";
import {
	type TSubscriberTableInput,
	useSubscriberTable,
} from "#/routes/_authenticated/subscribers/_hooks/use-subscriber-table.tsx";

export const SubscriberTable: FC<TSubscriberTableInput> = (
	props,
): ReactElement => {
	const table = useSubscriberTable(props);

	return (
		<DataTable
			table={table}
			emptyMessage={NEWSLETTER_MESSAGE.EMPTY}
			toolbar={<SubscriberSearch />}
			paginated
		/>
	);
};
