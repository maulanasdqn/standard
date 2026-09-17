import { NOTE_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { NoteSearch } from "#/routes/_authenticated/notes/_components/note-search.tsx";
import {
	type TNoteTableInput,
	useNoteTable,
} from "#/routes/_authenticated/notes/_hooks/use-note-table.tsx";

export const NoteTable: FC<TNoteTableInput> = (props): ReactElement => {
	const table = useNoteTable(props);

	return match(A.isEmpty(props.list.items))
		.with(true, () => <EmptyState message={NOTE_MESSAGE.EMPTY} />)
		.otherwise(() => (
			<DataTable table={table} toolbar={<NoteSearch />} paginated />
		));
};
