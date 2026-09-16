import { Guard } from "@app/components/guard/guard";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TNote } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { formatDateTime } from "@app/format";
import { DeleteConfirm } from "#/routes/_authenticated/_components/delete-confirm.tsx";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { useNoteDelete } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

type TNoteListProps = {
	notes: readonly TNote[];
};

export const NoteList: FC<TNoteListProps> = (props): ReactElement => {
	const noteDelete = useNoteDelete();

	return match(A.isEmpty(props.notes))
		.with(true, () => <EmptyState message={NOTE_MESSAGE.EMPTY} />)
		.otherwise(() => (
			<div className="flex flex-col gap-3">
				{A.map(props.notes, (note) => (
					<Card key={note.id} className="gap-2 py-4">
						<CardHeader className="px-4">
							<CardTitle>{note.title}</CardTitle>
							<CardDescription>{note.body}</CardDescription>
							<CardAction>
								<Guard permissions={[PERMISSION.NOTE_DELETE]}>
									<DeleteConfirm
										title={NOTE_MESSAGE.DELETE_CONFIRM_TITLE}
										description={NOTE_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
										disabled={noteDelete.isPending}
										onConfirm={() => noteDelete.mutate({ id: note.id })}
									/>
								</Guard>
							</CardAction>
						</CardHeader>
						<CardContent className="px-4 text-xs text-muted-foreground">
							{formatDateTime(note.createdAt)}
						</CardContent>
					</Card>
				))}
			</div>
		));
};
