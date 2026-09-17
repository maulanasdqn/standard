import { formatDateTime } from "@app/format";
import { NOTE_MESSAGE } from "@app/messages";
import type { TNote } from "@app/schemas";
import {
	createColumnHelper,
	type ReactTable,
	useTable,
} from "@tanstack/react-table";
import type { ReactElement } from "react";
import { TABLE_FEATURES, type TTableFeatures } from "#/libs/table/features.ts";
import { NoteActionsCell } from "#/routes/_authenticated/notes/_components/note-actions-cell.tsx";

const helper = createColumnHelper<TTableFeatures, TNote>();

const getRowId = (note: TNote): string => note.id;

export const useNoteTable = (
	notes: readonly TNote[],
): ReactTable<TTableFeatures, TNote> => {
	const columns = helper.columns([
		helper.accessor("title", {
			header: NOTE_MESSAGE.COLUMN_TITLE,
			meta: { className: "font-medium" },
		}),
		helper.accessor("body", {
			header: NOTE_MESSAGE.COLUMN_BODY,
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
			meta: { className: "text-right" },
			cell: (context): ReactElement => (
				<NoteActionsCell note={context.row.original} />
			),
		}),
	]);

	return useTable({
		features: TABLE_FEATURES,
		columns,
		data: notes,
		getRowId,
	});
};
