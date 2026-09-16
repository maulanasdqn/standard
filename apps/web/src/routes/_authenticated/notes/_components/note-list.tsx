import { Guard } from "@app/components/guard/guard";
import { formatDateTime } from "@app/format";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TNote } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { useNoteDelete } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";
import { DeleteConfirm } from "#/routes/_authenticated/_components/delete-confirm.tsx";

type TNoteListProps = {
	notes: readonly TNote[];
};

export const NoteList: FC<TNoteListProps> = (props): ReactElement => {
	const noteDelete = useNoteDelete();

	return match(A.isEmpty(props.notes))
		.with(true, () => <EmptyState message={NOTE_MESSAGE.EMPTY} />)
		.otherwise(() => (
			<ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
				{A.map(props.notes, (note) => (
					<li
						key={note.id}
						className="flex items-start justify-between gap-4 p-4"
					>
						<div>
							<p className="font-medium">{note.title}</p>
							<p className="text-sm text-muted-foreground">{note.body}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{formatDateTime(note.createdAt)}
							</p>
						</div>
						<Guard permissions={[PERMISSION.NOTE_DELETE]}>
							<DeleteConfirm
								title={NOTE_MESSAGE.DELETE_CONFIRM_TITLE}
								description={NOTE_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
								disabled={noteDelete.isPending}
								onConfirm={() => noteDelete.mutate({ id: note.id })}
							/>
						</Guard>
					</li>
				))}
			</ul>
		));
};
