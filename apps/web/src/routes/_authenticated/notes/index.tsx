import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { noteListInputSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { NoteCreateForm } from "#/routes/_authenticated/notes/_components/note-create-form.tsx";
import { NoteList } from "#/routes/_authenticated/notes/_components/note-list.tsx";
import { useNoteList } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

export const Route = createFileRoute("/_authenticated/notes/")({
	validateSearch: noteListInputSchema,
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_READ] }),
	component: NotesPage,
});

function NotesPage(): ReactElement {
	const { data, isLoading } = useNoteList();

	return (
		<div className="flex max-w-2xl flex-col gap-6">
			<h1 className="text-xl font-semibold">Notes</h1>
			<NoteCreateForm />
			{isLoading ? (
				<p className="text-sm text-neutral-500">Loading…</p>
			) : (
				<NoteList notes={data?.items ?? []} />
			)}
		</div>
	);
}
