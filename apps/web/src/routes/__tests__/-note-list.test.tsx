import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import type { TSearchControl } from "#/libs/forms/use-search-form.ts";
import type { TSearchBoxProps } from "#/routes/_authenticated/_components/search-box.tsx";
import { describe, expect, it, vi } from "vitest";
import { NOTE_SORT, SORT_DIRECTION } from "@app/schemas";
import { NoteTable } from "#/routes/_authenticated/notes/_components/note-table.tsx";

const SEARCH_LABEL = "Search notes";

vi.mock(
	"#/routes/_authenticated/notes/_hooks/use-notes.ts",
	async (importOriginal) => ({
		...(await importOriginal<Record<string, unknown>>()),
		useNoteSearch: (): TSearchControl => ({ value: "", onChange: vi.fn() }),
	}),
);

vi.mock("#/routes/_authenticated/_components/search-box.tsx", () => ({
	SearchBox: (props: TSearchBoxProps): ReactElement => (
		<input aria-label={props.label} />
	),
}));

vi.mock("#/routes/_authenticated/notes/_components/note-filters.tsx", () => ({
	NoteFilters: (): ReactElement => <button type="button">Filters</button>,
}));

const renderWithClient = (ui: ReactElement): RenderResult => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

describe("NoteTable", () => {
	it("renders an empty state when there are no notes", (): void => {
		renderWithClient(
			<NoteTable
				list={{ items: [], total: 0, page: 1, pageSize: 20 }}
				sortBy={NOTE_SORT.CREATED_AT}
				sortDir={SORT_DIRECTION.DESC}
				onChange={() => undefined}
			/>,
		);
		expect(screen.getByText("No notes yet.")).toBeInTheDocument();
	});

	it("keeps the search box when a search finds nothing", (): void => {
		renderWithClient(
			<NoteTable
				list={{ items: [], total: 0, page: 1, pageSize: 20 }}
				sortBy={NOTE_SORT.CREATED_AT}
				sortDir={SORT_DIRECTION.DESC}
				onChange={() => undefined}
			/>,
		);
		expect(screen.getByLabelText(SEARCH_LABEL)).toBeInTheDocument();
		expect(screen.getByText("No notes yet.")).toBeInTheDocument();
	});
});
