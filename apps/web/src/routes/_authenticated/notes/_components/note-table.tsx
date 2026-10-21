import { NOTE_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { useNoteRowOpen } from "#/routes/_authenticated/notes/_hooks/use-note-row-actions.ts";
import { NoteFilters } from "#/routes/_authenticated/notes/_components/note-filters.tsx";
import { SearchBox } from "#/routes/_authenticated/_components/search-box.tsx";
import { useNoteSearch } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";
import {
	type TNoteTableInput,
	useNoteTable,
} from "#/routes/_authenticated/notes/_hooks/use-note-table.tsx";

export const NoteTable: FC<TNoteTableInput> = (props): ReactElement => {
	const table = useNoteTable(props);
	const search = useNoteSearch();
	const openRow = useNoteRowOpen();

	return (
		<DataTable
			table={table}
			emptyMessage={NOTE_MESSAGE.EMPTY}
			toolbar={
				<div className="flex flex-wrap items-center gap-2">
					<SearchBox
						control={search}
						placeholder={NOTE_MESSAGE.SEARCH_PLACEHOLDER}
						label={NOTE_MESSAGE.SEARCH_PLACEHOLDER}
					/>
					<NoteFilters />
				</div>
			}
			paginated
			onRowClick={openRow}
		/>
	);
};
