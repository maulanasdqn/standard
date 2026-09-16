import { NOTE_MESSAGE } from "@app/messages";
import type { TNote } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { DataTable } from "#/routes/_authenticated/_components/data-table.tsx";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { useNoteTable } from "#/routes/_authenticated/notes/_hooks/use-note-table.tsx";

type TNoteTableProps = {
	notes: readonly TNote[];
};

export const NoteTable: FC<TNoteTableProps> = (props): ReactElement => {
	const table = useNoteTable(props.notes);

	return match(A.isEmpty(props.notes))
		.with(true, () => <EmptyState message={NOTE_MESSAGE.EMPTY} />)
		.otherwise(() => <DataTable table={table} />);
};
