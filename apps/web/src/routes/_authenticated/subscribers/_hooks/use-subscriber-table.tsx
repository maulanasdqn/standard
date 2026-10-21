import { formatDateTime } from "@app/format";
import { NEWSLETTER_MESSAGE } from "@app/messages";
import {
	NEWSLETTER_SORT,
	type TNewsletterSort,
	type TNewsletterSubscriber,
	type TNewsletterSubscriberList,
	type TSortDirection,
} from "@app/schemas";
import { createColumnHelper, type ReactTable } from "@tanstack/react-table";
import type { ReactElement } from "react";
import type { TTableFeatures } from "#/libs/table/features.ts";
import type { TListChange } from "#/libs/table/list-patch.ts";
import { useServerTable } from "#/routes/_authenticated/_hooks/use-server-table.ts";
import { SubscriberActionsCell } from "#/routes/_authenticated/subscribers/_components/subscriber-actions-cell.tsx";
import { SubscriberStatusBadge } from "#/routes/_authenticated/subscribers/_components/subscriber-status-badge.tsx";
import { subscriberSourceLabel } from "#/routes/_authenticated/subscribers/_utils/subscriber-labels.ts";

const helper = createColumnHelper<TTableFeatures, TNewsletterSubscriber>();

const getRowId = (subscriber: TNewsletterSubscriber): string => subscriber.id;

const SORT_KEYS: readonly TNewsletterSort[] = [
	NEWSLETTER_SORT.EMAIL,
	NEWSLETTER_SORT.CREATED_AT,
];

const columns = helper.columns([
	helper.accessor("email", {
		header: NEWSLETTER_MESSAGE.COLUMN_EMAIL,
		meta: { className: "font-medium" },
	}),
	helper.accessor("status", {
		header: NEWSLETTER_MESSAGE.COLUMN_STATUS,
		enableSorting: false,
		cell: (context): ReactElement => (
			<SubscriberStatusBadge status={context.getValue()} />
		),
	}),
	helper.accessor("source", {
		header: NEWSLETTER_MESSAGE.COLUMN_SOURCE,
		enableSorting: false,
		meta: { className: "text-muted-foreground" },
		cell: (context): string => subscriberSourceLabel(context.getValue()),
	}),
	helper.accessor("createdAt", {
		header: NEWSLETTER_MESSAGE.COLUMN_CREATED,
		meta: { className: "text-muted-foreground" },
		cell: (context): string => formatDateTime(context.getValue()),
	}),
	helper.display({
		id: "actions",
		header: NEWSLETTER_MESSAGE.COLUMN_ACTIONS,
		enableHiding: false,
		meta: { className: "text-right" },
		cell: (context): ReactElement => (
			<SubscriberActionsCell subscriber={context.row.original} />
		),
	}),
]);

export type TSubscriberTableInput = {
	list: TNewsletterSubscriberList;
	sortBy: TNewsletterSort;
	sortDir: TSortDirection;
	onChange: TListChange<TNewsletterSort>;
};

export const useSubscriberTable = (
	input: TSubscriberTableInput,
): ReactTable<TTableFeatures, TNewsletterSubscriber> =>
	useServerTable({
		columns,
		data: input.list.items,
		getRowId,
		total: input.list.total,
		page: input.list.page,
		pageSize: input.list.pageSize,
		sortBy: input.sortBy,
		sortDir: input.sortDir,
		sortKeys: SORT_KEYS,
		onChange: input.onChange,
	});
