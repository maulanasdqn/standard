import { Guard } from "@app/components/guard/guard";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TNote } from "@app/schemas";
import { Button } from "@app/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import type { FC, ReactElement } from "react";
import { DeleteConfirm } from "#/routes/_authenticated/_components/delete-confirm.tsx";
import { RowAction } from "#/routes/_authenticated/_components/row-action.tsx";
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
			<Guard permissions={[PERMISSION.NOTE_UPDATE]}>
				<RowAction label={NOTE_MESSAGE.ACTION_EDIT}>
					<Button variant="ghost" size="icon-sm" asChild>
						<Link
							to="/notes/$noteId"
							params={{ noteId: props.note.id }}
							aria-label={NOTE_MESSAGE.ACTION_EDIT}
						>
							<Pencil />
						</Link>
					</Button>
				</RowAction>
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
