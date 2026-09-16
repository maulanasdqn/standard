import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { NoteEditForm } from "#/routes/_authenticated/notes/_components/note-edit-form.tsx";
import {
	noteGetOptions,
	useNoteGet,
} from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const NoteEditPage: FC = (): ReactElement => {
	const { data } = useNoteGet();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<h1 className="text-xl font-semibold">{NOTE_MESSAGE.EDIT_NOTE}</h1>
			<NoteEditForm note={data} />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/notes/$noteId")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_WRITE] }),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(noteGetOptions(params.noteId)),
	component: NoteEditPage,
});
