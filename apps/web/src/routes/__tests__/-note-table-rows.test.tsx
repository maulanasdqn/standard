import { formatDateTime } from "@app/format";
import { NOTE_SORT, SORT_DIRECTION, type TNote } from "@app/schemas";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { NoteTable } from "#/routes/_authenticated/notes/_components/note-table.tsx";

const ACTIONS_LABEL = "note actions";
const CREATED_AT = "2026-01-02T03:04:00.000Z";

vi.mock("#/routes/_authenticated/notes/_components/note-search.tsx", () => ({
	NoteSearch: (): ReactElement => <input aria-label="Search notes" />,
}));

vi.mock(
	"#/routes/_authenticated/notes/_components/note-actions-cell.tsx",
	() => ({
		NoteActionsCell: (): ReactElement => <span>{ACTIONS_LABEL}</span>,
	}),
);

const notes: readonly TNote[] = [
	{
		id: "11111111-1111-4111-8111-111111111111",
		title: "First note",
		body: "The body of the first note",
		authorId: "22222222-2222-4222-8222-222222222222",
		version: 1,
		createdAt: CREATED_AT,
		updatedAt: CREATED_AT,
	},
	{
		id: "33333333-3333-4333-8333-333333333333",
		title: "Second note",
		body: "",
		authorId: "22222222-2222-4222-8222-222222222222",
		version: 1,
		createdAt: CREATED_AT,
		updatedAt: CREATED_AT,
	},
];

const renderWithClient = (ui: ReactElement): RenderResult => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

const renderRows = (): RenderResult =>
	renderWithClient(
		<NoteTable
			list={{ items: notes, total: notes.length, page: 1, pageSize: 20 }}
			sortBy={NOTE_SORT.CREATED_AT}
			sortDir={SORT_DIRECTION.DESC}
			onChange={() => undefined}
		/>,
	);

describe("NoteTable with rows", () => {
	it("renders one row per note with its title and body", (): void => {
		renderRows();

		expect(screen.getByRole("row", { name: /first note/i })).toBeVisible();
		expect(screen.getByText("The body of the first note")).toBeVisible();
		expect(screen.getByRole("row", { name: /second note/i })).toBeVisible();
		expect(screen.queryByText("No notes yet.")).not.toBeInTheDocument();
	});

	it("formats the creation time for people rather than machines", (): void => {
		renderRows();

		expect(screen.getAllByText(formatDateTime(CREATED_AT))).toHaveLength(
			notes.length,
		);
	});

	it("gives every row its actions cell", (): void => {
		renderRows();

		expect(screen.getAllByText(ACTIONS_LABEL)).toHaveLength(notes.length);
	});

	it("shows the pagination summary for the page", (): void => {
		renderRows();

		expect(
			screen.getByText(`1-${notes.length} of ${notes.length}`),
		).toBeVisible();
	});
});
