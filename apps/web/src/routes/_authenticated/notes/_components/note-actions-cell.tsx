import { NOTE_MESSAGE } from "@app/messages";
import type { TNote } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { RowActionsCell } from "#/routes/_authenticated/_components/row-actions-cell.tsx";
import { useNoteRowActions } from "#/routes/_authenticated/notes/_hooks/use-note-row-actions.ts";

type TNoteActionsCellProps = {
	note: TNote;
};

export const NoteActionsCell: FC<TNoteActionsCellProps> = (
	props,
): ReactElement => {
	const row = useNoteRowActions(props.note);

	return (
		<RowActionsCell
			actions={row.actions}
			confirm={row.confirm}
			confirmTitle={NOTE_MESSAGE.DELETE_CONFIRM_TITLE}
			confirmDescription={NOTE_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
		/>
	);
};
