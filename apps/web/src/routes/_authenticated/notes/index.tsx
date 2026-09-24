import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { Button } from "@app/components/ui/button";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { noteListInputSchema } from "@app/schemas";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { FC, ReactElement } from "react";
import { searchLenient } from "#/libs/table/search-lenient.ts";
import { NoteTable } from "#/routes/_authenticated/notes/_components/note-table.tsx";
import {
	noteListOptions,
	useNoteList,
	useNoteListChange,
} from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const noteSearchValidate = searchLenient(noteListInputSchema);

const NotesPage: FC = (): ReactElement => {
	const { data } = useNoteList();
	const search = Route.useSearch();
	const onChange = useNoteListChange();

	return (
		<div className="flex flex-col gap-6">
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
			<NoteTable
				list={data}
				sortBy={search.sortBy}
				sortDir={search.sortDir}
				onChange={onChange}
			/>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/notes/")({
	validateSearch: noteSearchValidate,
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_READ] }),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(noteListOptions(deps.search)),
	component: NotesPage,
});
