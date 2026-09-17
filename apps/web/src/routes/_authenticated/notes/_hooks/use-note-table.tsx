import { formatDateTime } from "@app/format";
import { NOTE_MESSAGE } from "@app/messages";
import {
	NOTE_SORT,
	type TNote,
	type TNoteList,
	type TNoteSort,
	type TSortDirection,
} from "@app/schemas";
import { createColumnHelper, type ReactTable } from "@tanstack/react-table";
import type { ReactElement } from "react";
import type { TTableFeatures } from "#/libs/table/features.ts";
import type { TListChange } from "#/libs/table/list-patch.ts";
import { useServerTable } from "#/routes/_authenticated/_hooks/use-server-table.ts";
import { NoteActionsCell } from "#/routes/_authenticated/notes/_components/note-actions-cell.tsx";

const helper = createColumnHelper<TTableFeatures, TNote>();

const getRowId = (note: TNote): string => note.id;

const SORT_KEYS: readonly TNoteSort[] = [NOTE_SORT.TITLE, NOTE_SORT.CREATED_AT];

const columns = helper.columns([
	helper.accessor("title", {
		header: NOTE_MESSAGE.COLUMN_TITLE,
		meta: { className: "font-medium" },
	}),
	helper.accessor("body", {
		header: NOTE_MESSAGE.COLUMN_BODY,
		enableSorting: false,
		meta: { className: "text-muted-foreground max-w-xs truncate" },
	}),
	helper.accessor("createdAt", {
		header: NOTE_MESSAGE.COLUMN_CREATED,
		meta: { className: "text-muted-foreground" },
		cell: (context): string => formatDateTime(context.getValue()),
	}),
	helper.display({
		id: "actions",
		header: NOTE_MESSAGE.COLUMN_ACTIONS,
		enableHiding: false,
		meta: { className: "text-right" },
		cell: (context): ReactElement => (
			<NoteActionsCell note={context.row.original} />
		),
	}),
]);

export type TNoteTableInput = {
	list: TNoteList;
	sortBy: TNoteSort;
	sortDir: TSortDirection;
	onChange: TListChange<TNoteSort>;
};

export const useNoteTable = (
	input: TNoteTableInput,
): ReactTable<TTableFeatures, TNote> =>
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
