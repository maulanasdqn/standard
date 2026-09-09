import { PERMISSION } from "@app/permissions";
import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { createFileRoute } from "@tanstack/react-router";
import { CreateNoteForm } from "#/routes/_authenticated/notes/_components/create-note-form.tsx";
import { NoteList } from "#/routes/_authenticated/notes/_components/note-list.tsx";
import { notesSearchSchema } from "#/routes/_authenticated/notes/_constants/search.ts";
import { useNotes } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

export const Route = createFileRoute("/_authenticated/notes/")({
	validateSearch: notesSearchSchema,
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_READ] }),
	component: NotesPage,
});

function NotesPage() {
	const { data, isLoading } = useNotes();

	return (
		<div className="flex max-w-2xl flex-col gap-6">
			<h1 className="text-xl font-semibold">Notes</h1>
			<CreateNoteForm />
			{isLoading ? (
				<p className="text-sm text-neutral-500">Loading…</p>
			) : (
				<NoteList notes={data?.items ?? []} />
			)}
		</div>
	);
}
