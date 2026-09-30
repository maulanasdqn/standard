import { NOTE_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { useNoteRowOpen } from "#/routes/_authenticated/notes/_hooks/use-note-row-actions.ts";
import { NoteFilters } from "#/routes/_authenticated/notes/_components/note-filters.tsx";
import { NoteSearch } from "#/routes/_authenticated/notes/_components/note-search.tsx";
import {
	type TNoteTableInput,
	useNoteTable,
} from "#/routes/_authenticated/notes/_hooks/use-note-table.tsx";

export const NoteTable: FC<TNoteTableInput> = (props): ReactElement => {
	const table = useNoteTable(props);
	const openRow = useNoteRowOpen();

	return (
		<DataTable
			table={table}
			emptyMessage={NOTE_MESSAGE.EMPTY}
			toolbar={
				<div className="flex flex-wrap items-center gap-2">
					<NoteSearch />
					<NoteFilters />
				</div>
			}
			paginated
			onRowClick={openRow}
		/>
	);
};
