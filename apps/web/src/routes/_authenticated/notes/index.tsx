import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { noteListInputSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { NoteCreateForm } from "#/routes/_authenticated/notes/_components/note-create-form.tsx";
import { NoteList } from "#/routes/_authenticated/notes/_components/note-list.tsx";
import {
	noteListOptions,
	useNoteList,
} from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const NotesPage: FC = (): ReactElement => {
	const { data } = useNoteList();

	return (
		<div className="flex max-w-2xl flex-col gap-6">
			<h1 className="text-xl font-semibold">Notes</h1>
			<Guard permissions={[PERMISSION.NOTE_WRITE]}>
				<NoteCreateForm />
			</Guard>
			<NoteList notes={data.items} />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/notes/")({
	validateSearch: noteListInputSchema,
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_READ] }),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(noteListOptions(deps.search)),
	component: NotesPage,
});
