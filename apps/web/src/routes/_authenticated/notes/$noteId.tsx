import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { formatDateTime } from "@app/format";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { NoteEditForm } from "#/routes/_authenticated/notes/_components/note-edit-form.tsx";
import { NoteFormPage } from "#/routes/_authenticated/notes/_components/note-form-page.tsx";
import {
	noteGetOptions,
	useNoteGet,
} from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const NoteEditPage: FC = (): ReactElement => {
	const { data } = useNoteGet();

	return (
		<NoteFormPage
			title={NOTE_MESSAGE.EDIT_NOTE}
			description={NOTE_MESSAGE.EDIT_DESCRIPTION}
			meta={
				<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
					<div className="flex gap-1">
						<dt>{NOTE_MESSAGE.CREATED_AT}</dt>
						<dd>{formatDateTime(data.createdAt)}</dd>
					</div>
					<div className="flex gap-1">
						<dt>{NOTE_MESSAGE.UPDATED_AT}</dt>
						<dd>{formatDateTime(data.updatedAt)}</dd>
					</div>
				</dl>
			}
		>
			<NoteEditForm note={data} />
		</NoteFormPage>
	);
};

export const Route = createFileRoute("/_authenticated/notes/$noteId")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_WRITE] }),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(noteGetOptions(params.noteId)),
	component: NoteEditPage,
});
