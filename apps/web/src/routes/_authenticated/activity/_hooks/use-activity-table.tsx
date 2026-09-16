import { formatDateTime, NOT_SET, orDash } from "@app/format";
import { ACTIVITY_MESSAGE } from "@app/messages";
import type { TActivity } from "@app/schemas";
import {
	createColumnHelper,
	type ReactTable,
	useTable,
} from "@tanstack/react-table";
import type { ReactElement } from "react";
import { match, P } from "ts-pattern";
import { TABLE_FEATURES, type TTableFeatures } from "#/libs/table/features.ts";

const helper = createColumnHelper<TTableFeatures, TActivity>();

const getRowId = (entry: TActivity): string => entry.id;

const metadataLabel = (metadata: unknown): string =>
	match(metadata)
		.with(P.nullish, () => NOT_SET)
		.otherwise((value) => JSON.stringify(value));

const columns = helper.columns([
	helper.accessor("createdAt", {
		header: ACTIVITY_MESSAGE.COLUMN_WHEN,
		meta: { className: "whitespace-nowrap text-muted-foreground" },
		cell: (context): string => formatDateTime(context.getValue()),
	}),
	helper.accessor("actorEmail", {
		header: ACTIVITY_MESSAGE.COLUMN_ACTOR,
		cell: (context): string => orDash(context.getValue()),
	}),
	helper.accessor("action", {
		header: ACTIVITY_MESSAGE.COLUMN_ACTION,
		cell: (context): ReactElement => (
			<code className="text-xs">{context.getValue()}</code>
		),
	}),
	helper.display({
		id: "entity",
		header: ACTIVITY_MESSAGE.COLUMN_ENTITY,
		cell: (context): ReactElement => (
			<>
				<span className="text-muted-foreground">
					{context.row.original.resourceType}
				</span>{" "}
				<code className="text-xs text-muted-foreground">
					{context.row.original.resourceId}
				</code>
			</>
		),
	}),
	helper.accessor("metadata", {
		header: ACTIVITY_MESSAGE.COLUMN_DETAILS,
		meta: { className: "max-w-xs truncate text-xs text-muted-foreground" },
		cell: (context): string => metadataLabel(context.getValue()),
	}),
]);

export const useActivityTable = (
	entries: readonly TActivity[],
): ReactTable<TTableFeatures, TActivity> =>
	useTable({ features: TABLE_FEATURES, columns, data: entries, getRowId });
