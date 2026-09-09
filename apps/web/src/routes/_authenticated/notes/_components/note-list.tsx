import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import { formatDateTime } from "@app/format";
import { PERMISSION } from "@app/permissions";
import type { TNote } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { ReactElement } from "react";
import { match } from "ts-pattern";
import { useNoteDelete } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

type TNoteListProps = {
	notes: readonly TNote[];
};

export const NoteList = ({ notes }: TNoteListProps): ReactElement => {
	const noteDelete = useNoteDelete();

	return match(A.isEmpty(notes))
		.with(true, () => <p className="text-sm text-neutral-500">No notes yet.</p>)
		.otherwise(() => (
			<ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200">
				{A.map(notes, (note) => (
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
								onClick={() => noteDelete.mutate({ id: note.id })}
							>
								Delete
							</Button>
						</Guard>
					</li>
				))}
			</ul>
		));
};
