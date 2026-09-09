import { Button } from "@app/components/ui/button";
import { Guard } from "@app/components/guard/guard";
import { PERMISSION } from "@app/permissions";
import { formatDateTime } from "@app/format";
import type { TNote } from "@app/schemas";
import type { ReactElement } from "react";
import { useDeleteNote } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

type TNoteListProps = {
	notes: TNote[];
};

export const NoteList = ({ notes }: TNoteListProps): ReactElement => {
	const deleteNote = useDeleteNote();

	if (notes.length === 0) {
		return <p className="text-sm text-neutral-500">No notes yet.</p>;
	}

	return (
		<ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200">
			{notes.map((note) => (
				<li
					key={note.id}
					className="flex items-start justify-between gap-4 p-4"
				>
					<div>
						<p className="font-medium">{note.title}</p>
						<p className="text-sm text-neutral-500">{note.body}</p>
						<p className="mt-1 text-xs text-neutral-400">
							{formatDateTime(note.createdAt)}
						</p>
					</div>
					<Guard permissions={[PERMISSION.NOTE_DELETE]}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => deleteNote.mutate({ id: note.id })}
						>
							Delete
						</Button>
					</Guard>
				</li>
			))}
		</ul>
	);
};
