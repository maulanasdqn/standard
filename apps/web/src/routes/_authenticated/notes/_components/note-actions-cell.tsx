import { Guard } from "@app/components/guard/guard";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TNote } from "@app/schemas";
import { Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { DeleteConfirm } from "#/routes/_authenticated/_components/delete-confirm.tsx";
import { useNoteDelete } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

type TNoteActionsCellProps = {
	note: TNote;
};

export const NoteActionsCell: FC<TNoteActionsCellProps> = (
	props,
): ReactElement => {
	const noteDelete = useNoteDelete();

	return (
		<>
			<Guard permissions={[PERMISSION.NOTE_WRITE]}>
				<Link
					to="/notes/$noteId"
					params={{ noteId: props.note.id }}
					className="px-3 py-1 text-sm hover:underline"
				>
					{NOTE_MESSAGE.ACTION_EDIT}
				</Link>
			</Guard>
			<Guard permissions={[PERMISSION.NOTE_DELETE]}>
				<DeleteConfirm
					title={NOTE_MESSAGE.DELETE_CONFIRM_TITLE}
					description={NOTE_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
					disabled={noteDelete.isPending}
					onConfirm={() => noteDelete.mutate({ id: props.note.id })}
				/>
			</Guard>
		</>
	);
};
