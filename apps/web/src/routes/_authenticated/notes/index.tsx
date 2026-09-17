import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { Button } from "@app/components/ui/button";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { noteListInputSchema } from "@app/schemas";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { FC, ReactElement } from "react";
import { ListPagination } from "#/routes/_authenticated/_components/list-pagination.tsx";
import { NoteSearch } from "#/routes/_authenticated/notes/_components/note-search.tsx";
import { NoteTable } from "#/routes/_authenticated/notes/_components/note-table.tsx";
import {
	noteListOptions,
	useNoteList,
	useNotePageChange,
} from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const NotesPage: FC = (): ReactElement => {
	const { data } = useNoteList();
	const goToPage = useNotePageChange();

	return (
		<div className="flex max-w-5xl flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">{NOTE_MESSAGE.TITLE}</h1>
				<Guard permissions={[PERMISSION.NOTE_WRITE]}>
					<Button asChild size="sm">
						<Link to="/notes/create">
							<Plus className="mr-1 size-4" />
							{NOTE_MESSAGE.NEW_NOTE}
						</Link>
					</Button>
				</Guard>
			</div>
			<NoteSearch />
			<NoteTable notes={data.items} />
			<ListPagination pageInfo={data} noun="notes" onPageChange={goToPage} />
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
